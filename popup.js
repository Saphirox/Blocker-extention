
function drawBar(id, s1, label, color) {
    var ctx = document.getElementById(id).getContext('2d');
    var myChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
        labels: s1.map(c => c.name),
        datasets: [{
            label: label,
            data: s1.map(c => c.seconds),
            backgroundColor: s1.map(c => c.seconds).map(color),
            borderColor: s1.map(c => c.seconds).map(color)
        }]
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
}

function drawCharts(activityManager) {
    console.log(activityManager);
    const apps = activityManager.apps;

    const s1 = apps.filter(c => c.kind === 'productivity');
    const s2 = apps.filter(c => c.kind === 'procrastination');

    const productivitySeconds = 
    apps.filter(c => c.kind === 'productivity').map(c => c.seconds).reduce((acc, curr) => acc + curr, 0);

    const procrastinationSeconds = 
    apps.filter(c => c.kind === 'procrastination').map(c => c.seconds).reduce((acc, curr) => acc + curr, 0);

    drawBar("canvas1", s1, "Productivity", () =>
    `hsla(74, 100%, ${Math.floor(Math.random() * 80) + 20}%, 0.7)`);
    drawBar("canvas2", s2, "Procrastination",
    () =>`hsla(0, 100%, ${Math.floor(Math.random() * 80) + 20}%, 0.7)`);

    document.getElementById("productivity").innerHTML = productivitySeconds;
    document.getElementById("procrastination").innerHTML = procrastinationSeconds;
}

window.onload = function () {
    chrome.storage.local.get(['active-manager'], (obj) => {
        drawCharts(obj['active-manager']);
    });
}

chrome.runtime.onMessage.addListener(function(message, callback) {
    console.log("Changeds");
    document.body.innerHTML= "<p>Your time expired<p>";
    document.body.style.height = "768px";
    var s = document.getElementsByTagName('p')[0];
    s.style.fontSize = "46px";
    s.style.color = "#FFF";
    s.style.textAlign = "center";
    s.style.verticalAlign = 'middle';
    document.body.style.background = "#000";
});
