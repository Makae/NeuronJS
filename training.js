function train(inputs, dendrites, output, training_set, rate) {
	var admissible = 0.02;
	var error = 1000; 
	var result, tupel, expectation;
	var ctr = 0;
	var updated_weights = [];

	while(error > admissible) {
		ctr++;
		for(var i = 0; i < training_set.length; i++) {
			tupel = training_set[i];
			expectation = tupel[2];

			inputs[0].setOutput(tupel[0]);
			inputs[1].setOutput(tupel[1]);

			updated_weights = [];
			// debugger;
			for(var k = 0; k < dendrites.length; k++) {
				result = output.getOutput();
				var _error = (expectation - result);

				var orig_weight = dendrites[k].getWeight();
				correction = 0;
				if(result != expectation) {
					correction = rate * _error * dendrites[k].getWeight();
				}

				// Test corrected weight
				dendrites[k].setWeight(orig_weight + correction);

				if(Math.abs(_error) > Math.abs(expectation - output.getOutput()))
					updated_weights.push(orig_weight + correction);
				else
					updated_weights.push(orig_weight);
			}

			// debugger;
			for(var w = 0; w < dendrites.length; w++) {
				dendrites[w].setWeight(updated_weights[w]);
			}	
		}

		error = 0;
		for(var i = 0; i < training_set.length; i++) {
			tupel = training_set[i];
			expectation = tupel[2];
			
			inputs[0].setOutput(tupel[0]);
			inputs[1].setOutput(tupel[1]);
			
			result = output.getOutput();
			error += Math.abs(expectation - result);
	    }
	    
	    if(ctr % 4000 === 0) {
	    	console.table(dendrites);
	    }
	}
}