function drawPeanut(listar){
	d3.select('svg')
		.selectAll("*").remove();    	
	var width = 450,
		height = 450,
		radius = 200;
	var color = d3.scale.category20();

  for (var i = 0; i < listar.length; i++) {
    if(listar[i].votes>0){
      break;
    }
  }
  if (i === listar.length){
    listar= [{name: "Please vote", votes: 1}];
  }

	var svg = d3.select('svg')
  		.attr('width', width)
  		.attr('height', height)
  		.append('g')
  		.attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2-50) + ')');

  	var arc = d3.svg.arc()
  		.outerRadius(170)
  		.innerRadius(80);

  	var pie = d3.layout.pie()
  	.value(function(d) { return d.votes; })
  	.sort(null);

  	var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

  	var path = svg.selectAll('path')
  		.data(pie(listar))
  		.enter()
  		.append('path')
  		.attr('d', arc)
  		.attr('fill', function(d) { 
    		return color(d.data.name);
  		});

  		path.on("mouseover", function (d) {
    		div.transition()    
                .style("opacity", .8);    
            div.html(d.data.name+" : "+d.data.votes)  
                .style("left", d3.event.pageX + "px")   
                .style("top", d3.event.pageY + "px")
                .style("background-color", color(d.data.name));
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .style("opacity", 0); 
        });

  	var legendRectSize = 18;
	var legendSpacing = 4;

	var legend = svg.selectAll('.legend')
  		.data(color.domain())
  		.enter()
  		.append('g')
  		.attr('class', 'legend')
  		.attr('transform', function(d, i) {
    		var minHeight = 185;
    		var minWidth = -220  + 70*(Math.max(0, 4-Math.floor(Math.max(4,listar.length)/4)));;
    		var legW = minWidth+ Math.floor(i/4)*90;
    		var legH = minHeight + i%4*(legendRectSize+legendSpacing);
		    return 'translate(' + legW + ',' + legH + ')';
		});

	    legend.append('rect')
  			.attr('width', legendRectSize)
  			.attr('height', legendRectSize)
  			.style('fill', color)
  			.style('stroke', color);
  
  		legend.append('text')
  			.attr('x', legendRectSize + legendSpacing)
  			.attr('y', legendRectSize - legendSpacing)
  			.text(function(d) { return d; });
}