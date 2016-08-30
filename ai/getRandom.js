var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
 
module.exports = function(list, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
        return prev + cur;
    });

    if (!total_weight) {
    	return list[Math.floor(rand(0, list.length))];
    }
    
    var random_num = rand(0, total_weight);
    var weight_sum = 0;
    ////console.log(random_num)
     
    for (var i = 0; i < list.length; i++) {
        weight_sum += weight[i];
         
        if (random_num <= weight_sum) {
            return list[i];
        }
    }
};