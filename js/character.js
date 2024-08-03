let display = document.getElementById('display');
let character = document.getElementById('character');

function appendNumber(number) {
    display.value += number;
}

function appendOperator(operator) {
    display.value += ' ' + operator + ' ';
}

function clearDisplay() {
    display.value = '';
    hideCharacter();
}

function calculateResult() {
    try {
        let result = eval(display.value);
        display.value = result;
        if (result === 42) {  // 예시: 결과가 42일 때 캐릭터 표시
            showCharacter();
        } else {
            hideCharacter();
        }
    } catch (e) {
        display.value = 'Error';
        hideCharacter();
    }
}

function showCharacter() {
    character.style.display = 'block';
    setTimeout(hideCharacter, 3000);  // 3초 후에 캐릭터 숨기기
}

function hideCharacter() {
    character.style.display = 'none';
}
