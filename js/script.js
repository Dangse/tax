// 쉼표 표시 함수
function formatNumber(input) {
    // Remove commas and non-numeric characters
    var numericValue = input.value.replace(/,/g, '').replace(/\D/g, '');
    // Format with commas and update the input value
    input.value = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



//간단한 양도세 계산기 

function calculateTaxes() {
    var transferPrice = parseFloat(document.getElementById('transferPrice').value.replace(/,/g, ''));
    var acquisitionPrice = parseFloat(document.getElementById('acquisitionPrice').value.replace(/,/g, ''));
    var holdingPeriod = parseFloat(document.getElementById('holdingPeriod').value);  

       

        var capitalGain = transferPrice - acquisitionPrice;
        var longTermDeduction = calculateLongTermDeduction(capitalGain, holdingPeriod);
        var taxableIncome = capitalGain - longTermDeduction;
        var taxBase = Math.max(0, taxableIncome - 2500000);
        var transferTax = calculateTransferTax(taxBase);
        var localIncomeTax = transferTax * 0.1;
        var totalTax = transferTax + localIncomeTax;

        document.getElementById('transferValue').innerText = transferPrice.toLocaleString();
        document.getElementById('acquisitionValue').innerText = acquisitionPrice.toLocaleString();
        document.getElementById('capitalGain').innerText = capitalGain.toLocaleString();
        document.getElementById('longTermDeduction').innerText = longTermDeduction.toLocaleString();
        document.getElementById('taxableIncome').innerText = taxableIncome.toLocaleString();
        document.getElementById('taxBase').innerText = taxBase.toLocaleString();
        document.getElementById('transferTax').innerText = transferTax.toLocaleString();
        document.getElementById('localIncomeTax').innerText = localIncomeTax.toLocaleString();
        document.getElementById('totalTax').innerText = totalTax.toLocaleString();
    }
//장기보유특별공제 표1
    function calculateLongTermDeduction(capitalGain, holdingPeriod) {
         var deductionRate = 0;
        if (holdingPeriod >= 3 && holdingPeriod < 4) {
         deductionRate = 0.06;
        } else if (holdingPeriod >= 4 && holdingPeriod < 5) {
          deductionRate = 0.08;
        } else if (holdingPeriod >= 5) {
          deductionRate = Math.min(0.3, 0.02 * holdingPeriod);
        }

        return capitalGain * deductionRate;
        } 

// 양도세율표
function calculateTransferTax(taxBase) {
if (taxBase <= 14000000) {
    return taxBase * 0.06; // 6%
} else if (taxBase <= 50000000) {
    return taxBase * 0.15 - 1260000; // 15%, 1260000원 공제
} else if (taxBase <= 88000000) {
    return taxBase * 0.24 - 5760000; // 24%, 5760000원 공제
} else if (taxBase <= 150000000) {
    return taxBase * 0.35 - 15440000; // 35%, 15440000원 공제
} else if (taxBase <= 300000000) {
    return taxBase * 0.38 - 19940000; // 38%, 19940000원 공제
} else if (taxBase <= 500000000) {
    return taxBase * 0.40 - 25940000; // 40%, 25940000원 공제
} else if (taxBase <= 1000000000) {
    return taxBase * 0.42 - 35940000; // 42%, 35940000원 공제
} else {
    return taxBase * 0.45 - 65940000; // 45%, 65940000원 공제
}
}

