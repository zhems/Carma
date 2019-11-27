////////////DEVELOPMENTAL WORKSPACE/////////////

/* Cars.com 
var xRequest = new XMLHttpRequest();
xRequest.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var request = this.responseXML;
        request.getElementsByTagName("searchCriteriaBO")[0].childNodes[0].nodeValue = "30318";
        //document.getElementById("testbed").innerHTML;
        console.log(request.getElementsByTagName("searchCriteriaBO")[0].childNodes[3].nodeValue);
    }
};
xRequest.open("GET","request.xml");
xRequest.send();

var payload = new XMLHttpRequest();
payload.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
                   document.getElementById("testbed").innerHTML = payload.responseText;
        }
};
payload.open("POST","https://api.cars.com/InventorySearchService/1.0/rest/inventory/search");
 */

//////////////////////////////////////////////

d3.select("#landing-banner").attr("width",document.getElementById("landing-bg").clientWidth);

//System dimensions
var title_height = document.getElementById("controls").clientHeight;

//Tooltip for each listing
var tip = d3.tip()
    .direction("n")
    .html(function(d,width) {
        if (d.media.photo_links.length == 0) {
            return "<div class=\"tip alert alert-dark\">" +
                "<h4>" + d.build.year + " " + d.build.make + " " + d.build.model + "</h4>" +
                "<br /><br />" +
                "<span>No image available</span>" +
                "</div>";
        } else {
            var pic_width = Math.min(300,(d3.select("#canvas").attr("width") - 20));
            return "<div class=\"tip alert alert-dark\">" +
                "<h4>" + d.build.year + " " + d.build.make + " " + d.build.model + "</h4>" +
                "<span>Price: " + d.price + "</span>" + 
                "<br /><br />" +
                "<img " + 
                "width=" + pic_width + " " +
                "src=" + d.media.photo_links[0] + " />" +
                "</div>"
        }
    });

var svg;
var sim;

var listings = [];
var genres = [["all","All Cars"],["offroad","Off-road"],["family","Family Friendly"]];

//$("#side-toggler").on("click", function() {
//    console.log("toggle");
//    $("#filter-bar").toggleClass("active");
//});

$('#filter-nav').change(function() {
    var zip = 30318
    var genre = document.getElementById("filter-genres").value;

    d3.json("data/" + zip + "/" + genre).then(function(dump) {
        console.log(dump)
        listings = dump.listings;
        nav(listings);
        filter(listings);
    });
});

$('#filter').change(function() {
    filter();
});

$('#rank').change(function() {
    rank();
});

$(document).on("click", "#side-toggler", function() { 
});

$(document).on("click", "#search", function() { 

    var height = window.innerHeight - title_height;
    var width = document.getElementById("testbed").clientWidth;

    //Clustering positions
    var collisionForce = d3.forceCollide(40)
        .iterations(50);
    var centeringForce = d3.forceCenter(width / 2,height / 2);

    sim = d3.forceSimulation()
            .force("collide",collisionForce)
            .force("center",centeringForce)
            .on("tick",ticked);

    //Main Canvas
    svg = d3.select("#testbed")
        .append("svg")
        .attr("id","canvas")
        .attr("width",width)
        .attr("height",height)
        .call(function(d) {
            tip(d,width);
        })
        .call(function(d) {
            resize(d,sim)
        });

    var zip = document.getElementById("zip").value;
    var genre = document.getElementById("micro-genres").value;
    zip = 30318

    //Sample dataset for development purposes
    d3.json("data/" + zip + "/" + genre).then(function(dump) {
        console.log(dump)
        listings = dump.listings;
        nav(listings);
        filter(listings);
    });
});


//Do NOT use API.
//It works but we only have 300 calls per MONTH
/***********************************************************

var payload = new XMLHttpRequest();
payload.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

        var listings = JSON.parse(this.responseText).listings;
        draw(listings);
    }
};

var key = "oG1gTKvIs4P8WUgpEzFuNRh8GVYD8z0B";

payload.open("GET","http://marketcheck-prod.apigee.net/v1/search?api_key=" + key + "&latitude=33.75&longitude=-84.39&radius=100&car_type=used&start=0&rows=50");
payload.setRequestHeader("Content-Type","application/json");
payload.send();

************************************************************/

//Dynamically build filter list
function nav(listings) {

    d3.select("#filter-genres")
        .selectAll("option")
        .data(genres)
        .enter()
        .append("option")
        .attr("value",function(d) {
            console.log(d)
            return d[0]
        })
        .text(d => d[1]);

    var price = d3.extent(listings,function(d) {
        return d.price;
    });

    d3.select("#filter-price-label")
        .text("Maximum Price: " + price[1]);

    var filter_price = d3.select("#filter-price")
                        .attr("min",price[0])
                        .attr("max",price[1])
                        .attr("value",price[1]);

    var year = d3.extent(listings,function(d) {
        return d.build.year;
    });

    d3.select("#filter-year-label")
        .text("Minimum Year: " + year[0]);

    var filter_year = d3.select("#filter-year")
                        .attr("min",year[0])
                        .attr("max",year[1])
                        .attr("value",year[0]);

    d3.select("#filter-make")
        .selectAll("option")
        .data([])
        .exit().remove();

    var make = d3.set(listings,function(d) {
        return d.build.make;
    }).values().sort();
    make.unshift("All Brands");

    var filter_make = d3.select("#filter-make")
        .selectAll("option")
        .data(make)

    filter_make.enter()
        .append("option")
        .attr("value",function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

    d3.select("#filter-style")
        .selectAll("option")
        .data([])
        .exit().remove();

    var style = d3.set(listings,function(d) {
        return d.build.body_type;
    }).values().filter(x => x != "undefined").sort();
    style.unshift("All Body Styles");

    var filter_style = d3.select("#filter-style")
        .selectAll("option")
        .data(style)

    filter_style.enter()
        .append("option")
        .attr("value",function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

}

//Draw nodes
function draw(f_listings) {

    var temp = d3.extent(f_listings,function(d) {
        return d.build.year;
    });   

    //Circles
    svg.selectAll("text")
        .remove();

    console.log(f_listings);

    sim.nodes(f_listings);
    sim.force("collide").radius(function(d) {
        return (((temp[1] - d.build.year) / (temp[1] - temp[0])) * 30) + 5
    });
    sim.tick(10);
    sim.stop();

    var circles = svg.selectAll("circle")
        .data(sim.nodes())

    circles.exit()
        .transition()
            .duration(300)
            .style("fill-opacity",0)
            .remove();

    var nodes = circles.enter()
        .append("circle")
        .attr("r",function(d) {
            return ((temp[1] - d.build.year) / (temp[1] - temp[0])) * 30;
        })
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        })
        .style("fill-opacity",0)
        .classed("node",true)
        .on("mouseover",tip.show)
        .on("mouseout",tip.hide)
        .on("click",function(d) {
            window.open(d.vdp_url);
        })
        .transition()
            .duration(300)
            .style("fill-opacity",1);

    circles.transition()
        .duration(300)
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        });

    sim.restart();

    if (f_listings.length == 0) {
        svg_height = svg.attr("height");
        svg_width = svg.attr("width");
        svg.append("text")
            .attr("x",svg_width / 2)
            .attr("y",svg_height / 2)
            .text("No listings match your requirements")
            .classed("404",true);

    }
}

//Static simulation
function ticked() {
    svg.selectAll("circle")
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        });
}

//Responsive design
function resize(svg,force) {
    d3.select(window)
        .on("resize",function() {
            var width = document.getElementById("testbed").clientWidth;
            var title_height = document.getElementById("controls").clientHeight;
            var height = window.innerHeight - title_height;
            svg.attr("width",width)
                .attr("height",height);
            var centeringForce = d3.forceCenter(width / 2,height / 2);
            sim.force("center",centeringForce);
            sim.restart();
        });
}

//Filter function
function filter() {
    var filtered = listings;
     
    var max_price = document.getElementById("filter-price").value;
    filtered = filtered.filter(function(d) {
        return d.price <= max_price;
    });
    d3.select("#filter-price-label")
        .text("Maximum Price: " + max_price);

    var min_year = document.getElementById("filter-year").value;
    filtered = filtered.filter(function(d) {
        return d.build.year >= min_year;
    });
    d3.select("#filter-year-label")
        .text("Minimum Year: " + min_year);

    var selected_make = document.getElementById("filter-make").value;
    if (selected_make != "All Brands") {
        filtered = filtered.filter(function(d) {
            return d.build.make == selected_make;
        });
    } 

    var selected_style = document.getElementById("filter-style").value;
    if (selected_style != "All Body Styles") {
        filtered = filtered.filter(function(d) {
            return d.build.body_type == selected_style;
        });
    }

    draw(filtered);
}
