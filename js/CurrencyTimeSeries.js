const btn = document.querySelector("button");
const form = document.querySelector("form");
var myChart;

btn.disabled = true;

function checkDate() {
    // Use Javascript to set min and max dates
    var today = new Date();
    var dd = today.getDate();
    // let dd2 = dd + 1;
    var mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
    var yyyy = today.getFullYear();
    var yyyy2 = today.getFullYear() - 1;
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;
    prevYear = yyyy2 + '-' + mm + '-' + dd;

    document.getElementById("to").setAttribute("max", today);
    // document.getElementById("to").setAttribute("min", prevYear);
    // document.getElementById("from").setAttribute("min", prevYear);
    document.getElementById("from").setAttribute("max", today);
}

checkDate();

fetch("https://api.exchangerate.host/symbols").then(res => res.json())
    .then(ans => getCurrencyList(ans.symbols));

function getCurrencyList(currency) {

    document.getElementById("initial-currency").innerHTML = `
            <select onchange ="getCurrencyA(this.value)">
                <option>Choose a Currency</option>
                ${Object.values(currency).map(function (name) {
        return `<option>${name.code} ${name.description}</option>`
    }).join("")};
            </select>
            `;

    document.getElementById("final-currency").innerHTML = `
            <select onchange ="getCurrencyB(this.value)">
                <option>Choose a Currency</option>
                ${Object.values(currency).map(function (name) {
        return `<option>${name.code} ${name.description}</option>`
    }).join("")};
            </select>
            `;
}

let currencyA;
let currencyB;

var labelName = [], graphTitle;
var currencyData = [];

function getCurrencyA(a) {
    currencyA = a;

    if (currencyA === "Choose a Currency") {
        btn.disabled = true;
    }
    else {
        if (currencyB) {
            currencyB === "Choose a Currency" ? btn.disabled = true : btn.disabled = false;
        }
    }
}

function getCurrencyB(b) {
    currencyB = b;

    if (currencyB === "Choose a Currency") {
        btn.disabled = true;
    }
    else {
        if (currencyA) {
            currencyA === "Choose a Currency" ? btn.disabled = true : btn.disabled = false;
        }
    }
}


async function convertCurrency(event) {
    event.preventDefault();
    const formdata = new FormData(form);
    const value = Object.fromEntries(formdata.entries());

    let year1 = parseInt(value.from.slice(0, 4));
    let month1 = parseInt(value.from.slice(5, 7)) - 1;
    let day1 = parseInt(value.from.slice(8));
    let year2 = parseInt(value.to.slice(0, 4));
    let month2 = parseInt(value.to.slice(5, 7)) - 1;
    let day2 = parseInt(value.to.slice(8));
    let daysDifference = (new Date(year2, month2, day2) - new Date(year1, month1, day1)) / (3600 * 24 * 1000);

    if (value.from === "" || value.to === "") {
        alert("Please select Start and End Date");
    }

    else if (value.from > value.to) {
        alert("End Date must be later than the Start Date");
    }
    else if (daysDifference > 365) {
        alert("Only 365 day Interval can be displayed. Please change the End Date.");
    }
    else {
        let c1 = currencyA.slice(0, 3);
        let c2 = currencyB.slice(0, 3);
        console.log(c1, c2);
        const tableHead = document.getElementById("tableHead");

        const url = "https://api.exchangerate.host/timeseries?start_date=" + value.from + "&end_date=" + value.to + "&base=" + c1 + "&symbols=" + c2;
        console.log(url);
        const response2 = await fetch(url);
        const result = await response2.json();
        // console.log(result.rates);

        let date = Object.keys(result.rates);
        let rate = Object.values(result.rates);

        const tableData = document.getElementById("tableData");
        let dataHTML = "";

        for (let i in rate) {
            dataHTML += `<tr><td>${date[i]}</td><td>${rate[i][c2]}</td></tr>`;
            labelName[i] = date[i];
            currencyData[i] = rate[i][c2];
        }

        //printing the table (optional)
        // tableHead.innerHTML = `
        //         <tr>
        //             <th>Date</th>
        //             <th>${c1} to ${c2}</th>
        //         </tr>`;
        // tableData.innerHTML = dataHTML;

        document.getElementById("result2").innerHTML = `
        1 ${c1} is ${Object.values(currencyData)[currencyData.length - 1]} ${c2} on ${value.to}`;

        graphTitle = c1 + " VS " + c2;

        const labels = labelName;
        const myData = Object.values(currencyData);

        const data = {
            labels: labels,
            datasets: [{
                label: graphTitle,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: myData,
            }]
        };
        const config = {
            type: 'line',
            data,
            options: {}
        };
        if (myChart instanceof Chart) {
            myChart.destroy();
        }
        myChart = new Chart(
            document.getElementById('myChart'),
            config
        );
    }

}

//Fixing my bugs:
//3.removing the table and only keeping the graph
//4. adding styles

btn.addEventListener("click", convertCurrency);