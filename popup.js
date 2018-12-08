function drawCharts(activityManager) {
    console.log(activityManager);
    const apps = activityManager.apps;
    
    const productivitySeconds = 
    apps.filter(c => c.kind === 'productivity').map(c => c.seconds).reduce((acc, curr) => acc + curr, 0);

    const procrastinationSeconds = 
    apps.filter(c => c.kind === 'procrastination').map(c => c.seconds).reduce((acc, curr) => acc + curr, 0);

    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Productivity", "Procrastination"],
        datasets: [{
            label: '# of Votes',
            data: [productivitySeconds, procrastinationSeconds],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
}

window.onload = function () {
    chrome.storage.local.get(['active-manager'], (obj) => {
        drawCharts(obj['active-manager']);
    });
}