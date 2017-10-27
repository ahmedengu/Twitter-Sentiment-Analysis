angular.module("App", ['chart.js']).controller("Ctrl", ['$scope', function ($scope) {
    var socket = io.connect(location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''));
    $scope.negative = [];
    $scope.positive = [];
    $scope.natural = [];


    $scope.labels = [];
    $scope.series = ['Positive', 'Negative'];
    $scope.colors = ['#37a000', '#AC1C00'];


    $scope.data = [
        [],
        []
    ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{backgroundColor: "rgba(0,0,0,0)"}, {backgroundColor: "rgba(0,0,0,0)"}, {backgroundColor: "rgba(0,0,0,0)"}];
    $scope.options = {
        animation: false,
        responsive: true,
        scales: {
            xAxes: [{
                id: 'x-axis',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Time"
                }
            }],
            yAxes: [{
                id: 'y-axis',
                display: true,
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        return value % 1 == 0 ? value : '';
                    }
                },
                scaleLabel: {
                    display: true,
                    labelString: "Count"
                }
            }]
        }
    };

    for (var i = 0; i < 30; i++) {
        $scope.data[0].push(null);
        $scope.data[1].push(null);
        $scope.labels.push('');

    }
    $scope.data[0].push(0);
    $scope.data[1].push(0);
    $scope.labels.push('');
    socket.on("stream", function (tweet) {
        if (tweet.sentiment.score == 1)
            $scope.positive.unshift(tweet);
        else if (tweet.sentiment.score == -1)
            $scope.negative.unshift(tweet);
        else {
            $scope.natural.unshift(tweet);
            $scope.$apply();
            return;
        }
        $scope.labels.push(new Date().toLocaleTimeString());
        $scope.data[0].push($scope.positive.length);
        $scope.data[1].push($scope.negative.length);

        if ($scope.data[0].length > 30) {
            $scope.data[0].shift();
            $scope.data[1].shift();
            $scope.labels.shift();
        }
        $scope.$apply();
    });
    $scope.isLoading = false;
}]).filter('highlight', ['$sce', function ($sce) {
    return function (text, sentiment) {
        sentiment.positive.forEach(function (t) {
            if (t) text = text.replace(new RegExp(' (' + t + ') ', 'gi'),
                ' <span class="bg-turquoise">$1</span> ')
        });
        sentiment.negative.forEach(function (t) {
            if (t) text = text.replace(new RegExp(' (' + t + ') ', 'gi'),
                ' <span class="bg-milanored white">$1</span> ')
        });

        return $sce.trustAsHtml(text)
    }
}]);

$('.nav-item a').click(function () {
    $("#nav-toggle").click();
});