 // 다음 단계로 넘어가는 함수
 function nextStep(stepNum) {
    document.getElementById("step" + (stepNum - 1)).style.display = "none";
    document.getElementById("step" + stepNum).style.display = "block";
}

function previousStep(stepNum) {
    document.getElementById("step" + (stepNum + 1)).style.display = "none";
    document.getElementById("step" + stepNum).style.display = "block";
}

    // 도움말 팝업 표시 함수
function showHelpPopup(popupId) {
    document.getElementById(popupId).style.display = 'flex';
}

// 도움말 팝업 닫기 함수
function closeHelpPopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }



// 자산구분, 종류, 평가기준에 따른 팝업창, 배열설정 
const assetTypes = [
        { code: "A11", name: "상속재산 - 상속인" },
        { code: "A12", name: "상속재산 - 상속인외" },
        { code: "A13", name: "상속재산 - 상속개시전 처분재산" },
        { code: "A21", name: "증여재산가산 - 상속인" },
        { code: "A22", name: "증여재산가산 - 상속인외" },
        { code: "A23", name: "증여재산가산 - 창업자금" },
        { code: "A24", name: "증여재산가산 - 가업승계" },
        { code: "B11", name: "비과세자산 - 금양임야" },
        { code: "B12", name: "비과세자산 - 공공단체 유증" },
        { code: "B13", name: "비과세자산 - 기타" },
        { code: "B21", name: "과세가액불산입 - 공익법인출연재산" },
        { code: "B22", name: "과세가액불산입 - 공익신탁재산" }
    ];

const propertyTypes = [
        { code: "01", name: "현금" },
        { code: "02", name: "토지I (순수토지)" },
        { code: "03", name: "토지II [일반건물(07)의 부속토지]" },
        { code: "04", name: "개별주택 (주택부수토지 포함)" },
        { code: "05", name: "공동주택 (부수토지 포함)" },
        { code: "06", name: "오피스텔ㆍ상업용건물 (부수토지 포함)" },
        { code: "07", name: "일반건물*(부수토지 제외)" },
        { code: "08", name: "부동산을 취득할수 있는 권리" },
        { code: "09", name: "유가증권(상장)" },
        { code: "10", name: "유가증권(비상장)" },
        { code: "11", name: "금융재산( 현금, 유가증권제외)" },
        { code: "12", name: "기타재산" },
        { code: "13", name: "가상재산" },
        { code: "14", name: "서화골동품등" }
    ];

const evaluationStandards = [
        { code: "01", name: "해당 재산의 매매거래가액 (상증법 60조)" },
        { code: "02", name: "해당 재산의 감정가액 (상증법 60조)" },
        { code: "03", name: "해당 재산의 수용보상가액 (상증법 60조)" },
        { code: "04", name: "해당 재산의 경매공매가액 (상증법 60조)" },
        { code: "05", name: "유사재산의 매매사례가액 등" },
        { code: "06", name: "현금등가액 (상증법 60조)" },
        { code: "07", name: "저당권등평가특례가액 (상증법 60조)" },
        { code: "08", name: "기준시가등 보충적평가가액 (상증법 61조부터 65조)" }
    ];

function setupSelector(selectorId, popupId, contentId, data) {
        const selector = document.getElementById(selectorId);
        const popup = document.getElementById(popupId);
        const content = document.getElementById(contentId);
        const closeBtn = popup.querySelector('.close');

        function createContent() {
            content.innerHTML = '';
            data.forEach(item => {
                const button = document.createElement('button');
                button.textContent = `${item.name} - ${item.code}`;
                button.onclick = function() {
                    selector.textContent = item.code;
                    popup.style.display = 'none';
                };
                content.appendChild(button);
            });
        }

        selector.onclick = function(event) {
            event.stopPropagation();
            createContent();
            popup.style.display = 'block';
        }

        closeBtn.onclick = function() {
            popup.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == popup) {
                popup.style.display = 'none';
            }
        }
    }

    setupSelector('assetTypeSelector', 'assetTypePopup', 'assetTypeContent', assetTypes);
    setupSelector('propertyTypeSelector', 'propertyTypePopup', 'propertyTypeContent', propertyTypes);
    setupSelector('evaluationStandardSelector', 'evaluationStandardPopup', 'evaluationStandardContent', evaluationStandards);

// 각 행의 총액을 계산하는 함수
function calculateTotal(row) {
const quantityInput = row.querySelector('input[name="quantity"]');
const priceInput = row.querySelector('input[name="price"]');
const totalCell = row.querySelector('.total');

if (quantityInput && priceInput && totalCell) {
    const quantity = parseFloat(quantityInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const total = quantity * price;
    totalCell.textContent = total.toLocaleString('ko-KR'); // 한국 원화 형식으로 표시
}
updateGrandTotal();
}

// 전체 총액을 업데이트하는 함수
function updateGrandTotal() {
const totalCells = document.querySelectorAll('#assetTable tbody .total');
let grandTotal = 0;

totalCells.forEach(cell => {
    grandTotal += parseFloat(cell.textContent.replace(/,/g, '')) || 0;
});

const grandTotalCell = document.getElementById('grandTotal');
if (grandTotalCell) {
    grandTotalCell.textContent = grandTotal.toLocaleString('ko-KR'); // 한국 원화 형식으로 표시
}
}

// 각 행에 이벤트 리스너를 추가하는 함수
function addRowListeners(row) {
const quantityInput = row.querySelector('input[name="quantity"]');
const priceInput = row.querySelector('input[name="price"]');

if (quantityInput && priceInput) {
    quantityInput.addEventListener('input', () => calculateTotal(row));
    priceInput.addEventListener('input', () => calculateTotal(row));
}
}

// 새 행을 추가하는 함수
function addRow() {
const tbody = document.querySelector('#assetTable tbody');
const rowCount = tbody.rows.length;
const newRow = tbody.insertRow();
const index = rowCount + 1;

newRow.innerHTML = `
    <td><span id="assetTypeSelector${index}" class="selector">선택</span></td>
    <td><span id="propertyTypeSelector${index}" class="selector">선택</span></td>
    <td>
        <div class="checkbox-container">
            <label><input type="radio" name="isForeign${index}" value="yes">여</label>
            <label><input type="radio" name="isForeign${index}" value="no">부</label>
        </div>
    </td>
    <td><input type="text" name="foreignCountry"></td>
    <td><input type="text" name="location"></td>
    <td><input type="text" name="registrationNumber"></td>
    <td><input type="number" name="quantity" value="0" /></td>
    <td><input type="number" name="price" value="0" /></td>
    <td class="total">0</td>
    <td><span id="evaluationStandardSelector${index}" class="selector">선택</span></td>
    <td class="no-print"><button onclick="deleteRow(this)">삭제</button></td>
`;

// 새로운 선택기에 대한 이벤트 리스너 설정
setupSelector(`assetTypeSelector${index}`, 'assetTypePopup', 'assetTypeContent', assetTypes);
setupSelector(`propertyTypeSelector${index}`, 'propertyTypePopup', 'propertyTypeContent', propertyTypes);
setupSelector(`evaluationStandardSelector${index}`, 'evaluationStandardPopup', 'evaluationStandardContent', evaluationStandards);



addRowListeners(newRow);
calculateTotal(newRow);
}

// 행을 삭제하는 함수
function deleteRow(button) {
const row = button.closest('tr');
row.remove();
updateGrandTotal();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
const rows = document.querySelectorAll('#assetTable tbody tr');
rows.forEach(row => {
    addRowListeners(row);
    calculateTotal(row);
});
updateGrandTotal();

// '행 추가' 버튼에 이벤트 리스너 추가
const addButton = document.querySelector('.button-container button');
if (addButton) {
    addButton.addEventListener('click', addRow);
}
});




function formatInput(input) {
    input.value = formatNumber(input.value.replace(/,/g, ''));
}

// 인쇄 관련 스크립트
function printStep(stepNum) {
        document.body.setAttribute('data-print-step', stepNum);
        window.print();
        document.body.removeAttribute('data-print-step');
    }

    function printAll() {
        document.body.setAttribute('data-print-all', 'true');
        window.print();
        document.body.removeAttribute('data-print-all');
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Your existing JavaScript code here
        setupSelector('assetTypeSelector', 'assetTypePopup', 'assetTypeContent', assetTypes);
        setupSelector('propertyTypeSelector', 'propertyTypePopup', 'propertyTypeContent', propertyTypes);
        setupSelector('evaluationStandardSelector', 'evaluationStandardPopup', 'evaluationStandardContent', evaluationStandards);
    
        // ... rest of your initialization code
    });