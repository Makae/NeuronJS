// Binary A xor B

// var training_set = [
//     [1, 1, 0],
//     [0, 0, 0],
//     [0, 1, 1],
//     [1, 0, 1]
// ];

var training_set = [
    [0, 0, 0],
    [0, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
];

var input_axions = [
    new InputAxion(1),
    new InputAxion(1),
];

var inputs = [
    (new Neuron()).setAxion(input_axions[0]),
    (new Neuron()).setAxion(input_axions[1]),
];

var network = new NeuronalNetwork(inputs, Utilities.Thresholds.Sigmoid());
network.addLayer(2);
network.addLayer(2);
network.addLayer(2);
network.addLayer(1);

var inputs = input_axions;
var output_neurons = network.getOutputNeurons();
var dendrites = network.getDendrites();
var learn_rate = 0.05;
var admissible = 0.02;

function init_chart() {

    var training = new NetworkTraining(inputs, dendrites, output_neurons, learn_rate);

    var chart;
    var plot_data = [];


    training.addEventListener('finish', function(data) {

    });

    training.addEventListener('training_tupel', function(data) {
        console.table([{
            'set_idx' : data.set_idx,
            'value1' :  data.tupel[0],
            'value2' :  data.tupel[1],
            'target' : data.target,
            'output' : data.output,
        }]);
    });
    training.addEventListener('training_tupel_end', function(data) {
        console.table(data.training.getDendrites());
    });

    training.addEventListener('loop', function(data) {
        var dendrites = data.training.getDendrites();
        var new_plot_data = [];
        for(var i = 0; i < dendrites.length; i++) {
            plot_data[i].dataPoints.push({
                x: data.loop_idx,
                y: dendrites[i].getWeight()
            });

        }
        chart.render();
        console.log("===================");
        console.log("===== LOOPEND =====");
        console.log("===================");
    });
    var dendrites = training.getDendrites();
    var line;
    for(var i = 0; i < dendrites.length; i++) {
        line = { type: "line" };
        line.dataPoints = [];
        plot_data.push(line);
    };
    console.log(plot_data);

    chart = new CanvasJS.Chart("chart",
    {
        zoomEnabled: true,
        animationEnabled: false,
        title:{
            text: "Dendrites" 
        },
        axisX :{
            labelAngle: -30
        },
        axisY :{
            includeZero: true
        },
        data: plot_data  
    });
    chart.render();
}

function init_graph() {
    var nv_container = document.getElementById('network');
    var nv = new NetworkVisualizer(nv_container, network);
    nv.show();
}

window.onload = function () {
    // init_chart();
    init_graph();
    //training.train(training_set, admissible);    
};