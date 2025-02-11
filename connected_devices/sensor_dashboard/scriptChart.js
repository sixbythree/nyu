
const ntx = document.getElementById('northF');
const stx = document.getElementById('southF');
  
new Chart(ntx, {
    type: 'bar',
    data: {
    labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am',
             '7am', '8am', '9am', '10am', '11am', '12pm',
             '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
             '7pm', '8pm', '9pm', '10pm', '11pm'
    ],
    datasets: [{
        label: '# of People in Northern Floor',
        data: [], //[12, 19, 3, 5, 2, 3],
        borderWidth: 1
    }]
    },
    options: {
    scales: {
        x: {
            grid: {
                display: false // Disable vertical grid lines
            }
        },
        y: {
            grid: {
                display: true // Enable horizontal grid lines
            },
            beginAtZero: true
        }
    }
    }
});

new Chart(stx, {
    type: 'bar',
    data: {
    labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am',
             '7am', '8am', '9am', '10am', '11am', '12pm',
             '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
             '7pm', '8pm', '9pm', '10pm', '11pm'
    ],
    datasets: [{
        label: '# of People in Southern Floor',
        data: [], //[12, 19, 3, 5, 2, 3],
        borderWidth: 1
    }]
    },
    options: {
    scales: {
        x: {
            grid: {
                display: false // Disable vertical grid lines
            }
        },
        y: {
            grid: {
                display: true // Enable horizontal grid lines
            },
            beginAtZero: true
        }
    }
    }
});