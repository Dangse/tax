/**
 * 대한세무법인 · 워크샵 결과물 발표 업로드 백엔드
 * ------------------------------------------------------------------
 * 이 코드를 script.google.com 프로젝트에 붙여넣고 "웹 앱"으로 배포하면
 * tax/내부결재문서/워크샵결과물발표.html 에서 바로 사용할 수 있습니다.
 *
 * 설치 방법: scripts/워크샵발표_설치안내.md 참고
 *
 * 저장 위치
 *   - HTML 파일  : 구글 드라이브 폴더 "워크샵 결과물 발표"
 *   - 목록(메타)  : 구글 스프레드시트 "워크샵 결과물 발표 목록"
 *   두 곳 모두 초기설정() 실행 시 자동으로 만들어집니다.
 */

/* ===== 설정 ===== */
var 비밀번호 = '0625';                 // index.html 의 내부결재문서 비밀번호와 동일하게
var 폴더이름 = '워크샵 결과물 발표';
var 시트이름 = '워크샵 결과물 발표 목록';
var 최대용량 = 5 * 1024 * 1024;         // 5MB
var 헤더 = ['등록일시', '발표자', '제목', '설명', '파일ID', '파일명', '링크', '발표완료'];


/* ==================================================================
   1) 최초 1회 실행 — 드라이브 폴더와 스프레드시트를 만듭니다.
   ================================================================== */
function 초기설정() {
  var info = 준비_();
  Logger.log('폴더: https://drive.google.com/drive/folders/' + info.folderId);
  Logger.log('시트: https://docs.google.com/spreadsheets/d/' + info.sheetId);
  return info;
}


/* ==================================================================
   2) 웹 요청 처리
   ================================================================== */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';

  if (action === 'view') {
    return 보기_(e.parameter.id);
  }
  try {
    return json_({ ok: true, items: 목록_() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);

    if (req.pw !== 비밀번호) {
      return json_({ ok: false, error: '비밀번호가 일치하지 않습니다.' });
    }
    if (req.action === 'upload') return json_(올리기_(req));
    if (req.action === 'delete') return json_(지우기_(req));
    if (req.action === 'done')   return json_(완료_(req));

    return json_({ ok: false, error: '알 수 없는 요청입니다: ' + req.action });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}


/* ==================================================================
   3) 기능
   ================================================================== */

/** 목록 조회 — 최신순 */
function 목록_() {
  var sheet = 준비_().sheet;
  var last = sheet.getLastRow();
  if (last < 2) return [];

  var rows = sheet.getRange(2, 1, last - 1, 헤더.length).getValues();
  var items = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[4]) continue;                       // 파일ID 없는 행은 건너뜀
    items.push({
      date: 날짜_(r[0]),
      name: String(r[1] || ''),
      title: String(r[2] || ''),
      desc: String(r[3] || ''),
      id: String(r[4]),
      filename: String(r[5] || ''),
      link: String(r[6] || ''),
      done: 날짜_(r[7])                        // 발표완료 시각, 비어 있으면 아직 발표 전
    });
  }
  return items.reverse();
}

/** 업로드 — HTML 파일 또는 링크 주소 둘 중 하나 */
function 올리기_(req) {
  var name = String(req.name || '').trim();
  var title = String(req.title || '').trim();
  var desc = String(req.desc || '').trim();
  var link = String(req.link || '').trim();
  var filename = String(req.filename || 'untitled.html').trim();

  if (!name || !title) throw new Error('이름과 제목은 반드시 입력해야 합니다.');
  if (!req.content && !link) throw new Error('HTML 파일이나 링크 주소 중 하나는 있어야 합니다.');

  var info = 준비_();

  // (1) 링크만 등록 — 드라이브에 파일을 만들지 않습니다.
  if (!req.content) {
    if (!/^https?:\/\/.+/i.test(link)) {
      throw new Error('http:// 또는 https:// 로 시작하는 주소만 등록할 수 있습니다.');
    }
    var key = Utilities.getUuid();          // 삭제할 때 쓰는 구분값
    info.sheet.appendRow([new Date(), name, title, desc, key, '', link, '']);
    return { ok: true, id: key, link: link };
  }

  // (2) HTML 파일 업로드
  if (!/\.(html?|htm)$/i.test(filename)) throw new Error('HTML 파일만 올릴 수 있습니다.');

  var bytes = Utilities.base64Decode(req.content);
  if (bytes.length > 최대용량) throw new Error('파일이 5MB를 넘습니다.');

  var stamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd_HHmmss');
  var blob = Utilities.newBlob(bytes, 'text/html', stamp + '_' + name + '_' + filename);
  var file = info.folder.createFile(blob);

  info.sheet.appendRow([new Date(), name, title, desc, file.getId(), filename, '', '']);

  return { ok: true, id: file.getId() };
}

/** 삭제 — 시트에서 행 제거, 파일이 있으면 휴지통으로 (링크 항목은 파일이 없음) */
function 지우기_(req) {
  var id = String(req.id || '').trim();
  if (!id) throw new Error('삭제할 파일이 지정되지 않았습니다.');

  var sheet = 준비_().sheet;
  var last = sheet.getLastRow();
  var found = false;

  for (var row = last; row >= 2; row--) {
    if (String(sheet.getRange(row, 5).getValue()) === id) {
      sheet.deleteRow(row);
      found = true;
    }
  }
  if (!found) throw new Error('목록에 없는 파일입니다.');

  try {
    DriveApp.getFileById(id).setTrashed(true);
  } catch (err) {
    // 파일이 이미 없어도 목록에서 지워졌으면 성공으로 처리
  }
  return { ok: true };
}

/** 발표완료 표시 / 되돌리기 — done: true 면 완료 시각 기록, false 면 지움 */
function 완료_(req) {
  var id = String(req.id || '').trim();
  if (!id) throw new Error('대상이 지정되지 않았습니다.');

  var sheet = 준비_().sheet;
  var col = 헤더.indexOf('발표완료') + 1;
  var last = sheet.getLastRow();

  for (var row = 2; row <= last; row++) {
    if (String(sheet.getRange(row, 5).getValue()) === id) {
      var value = req.done ? new Date() : '';
      sheet.getRange(row, col).setValue(value);
      return { ok: true, id: id, done: value ? 날짜_(value) : '' };
    }
  }
  throw new Error('목록에 없는 항목입니다.');
}

/** 열람 — 등록된 파일만 HTML 로 그려서 보여줍니다. */
function 보기_(id) {
  id = String(id || '').trim();
  if (!id) return 안내_('파일이 지정되지 않았습니다.');

  var items = 목록_();
  var hit = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) { hit = items[i]; break; }
  }
  if (!hit) return 안내_('목록에 등록되지 않은 파일입니다.');

  // 링크로 등록된 항목이면 해당 주소로 넘겨줍니다.
  if (hit.link) {
    var safe = hit.link.replace(/"/g, '&quot;');
    return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">'
      + '<meta http-equiv="refresh" content="0; url=' + safe + '"></head>'
      + '<body><p>이동 중입니다… <a href="' + safe + '" target="_blank">바로 열기</a></p></body></html>')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  var html;
  try {
    html = DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8');
  } catch (err) {
    return 안내_('파일을 열 수 없습니다. 삭제되었을 수 있습니다.');
  }

  return HtmlService.createHtmlOutput(html)
    .setTitle(hit.title + ' · 대한세무법인')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/* ==================================================================
   4) 공통
   ================================================================== */

/** 폴더 · 시트를 확보하고 (없으면 생성) 핸들을 돌려줍니다. */
function 준비_() {
  var props = PropertiesService.getScriptProperties();

  var folderId = props.getProperty('FOLDER_ID');
  var folder = null;
  if (folderId) {
    try { folder = DriveApp.getFolderById(folderId); } catch (err) { folder = null; }
  }
  if (!folder) {
    folder = DriveApp.createFolder(폴더이름);
    folderId = folder.getId();
    props.setProperty('FOLDER_ID', folderId);
  }

  var sheetId = props.getProperty('SHEET_ID');
  var ss = null;
  if (sheetId) {
    try { ss = SpreadsheetApp.openById(sheetId); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(시트이름);
    sheetId = ss.getId();
    props.setProperty('SHEET_ID', sheetId);
    DriveApp.getFileById(sheetId).moveTo(folder);
  }

  var sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(헤더);
    sheet.getRange(1, 1, 1, 헤더.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    // 이전 버전 시트에 없는 열('링크', '발표완료' 등)을 자동으로 채워 넣습니다.
    var head = sheet.getRange(1, 1, 1, 헤더.length).getValues()[0];
    for (var c = 0; c < 헤더.length; c++) {
      if (head[c] !== 헤더[c]) sheet.getRange(1, c + 1).setValue(헤더[c]).setFontWeight('bold');
    }
  }

  return { folder: folder, folderId: folderId, sheet: sheet, sheetId: sheetId };
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function 날짜_(v) {
  if (!v) return '';
  var d = (v instanceof Date) ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
}

function 안내_(message) {
  var body = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">'
    + '<style>body{font-family:"Noto Sans KR",sans-serif;padding:60px 20px;text-align:center;color:#1c2b3a}'
    + 'p{color:#6b7f92}</style></head><body>'
    + '<h2>열 수 없습니다</h2><p>' + message + '</p></body></html>';
  return HtmlService.createHtmlOutput(body)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
