var NJS_TEST_MODUS = 1;
// Binary A xor B

// var training_set = [
//     [1, 1, 0],
//     [0, 0, 0],
//     [0, 1, 1],
//     [1, 0, 1]
// ];

var training_set = [
//  i1, i2, output
    [[0, 0], [0]],
    [[0, 1], [0]],
    [[1, 0], [0]],
    [[1, 1], [1]]
];

var input_axions = [
    new InputAxion(1),
    new InputAxion(1),
];

var inputs = [
    (new Neuron()).setAxion(input_axions[0]),
    (new Neuron()).setAxion(input_axions[1]),
];

var network_visualizer;
var network = new NeuronalNetwork(inputs, Utilities.Thresholds.Sigmoid);;

network.addLayer(2);
// network.addLayer(2);
// network.addLayer(2);
network.addLayer(1);

var inputs = input_axions;
var output_axions = network.getOutputAxions();
var dendrites = network.getDendrites();
var learn_rate = 0.05;
var admissible = 0.1;
var step_speed = 10;
var training;

function start_training() {

    training = new NetworkTraining(inputs, dendrites, output_axions, learn_rate);

    var chart;
    var plot_data = [];

    training.addEventListener('finish', function(data) {

    });

    training.addEventListener('training_tupel', function(data) {
        console.table([{
            'set_idx' : data.set_idx,
            'value1' :  data.tupel[0],
            'value2' :  data.tupel[1],
            'target_values' :  data.target_values,
            'output' :  data.output,
        }]);
    });
    training.addEventListener('training_tupel_end', function(data) {
        console.table(data.training.getDendrites());
    });

    training.addEventListener('after_input_change', function(data) {
        network_visualizer.updateNetwork();
    });
    training.addEventListener('after_fwd_pass', function(data) {
        network_visualizer.updateNetwork();
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
    });

    dendrites = training.getDendrites();
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

    training.train(training_set, admissible, step_speed);
}

function test_setup() {
    var nv_container = document.getElementById('network');
    network_visualizer = new NetworkVisualizer(nv_container, network);
    network_visualizer.init();
}

function test_run() {
    start_training();
}

function test_setup_n_run() {
    test_setup();
    start_training();
}

var pause = false;
function test_toggle_pause() {
    if(pause) {
        document.querySelector("#pause").text = "Pause (running)";
        training.unpause();
    } else {
        document.querySelector("#pause").text = "Run (in pause)";
        training.pause();
    }
    pause = !pause;
}