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

//System dimensions
var width = document.getElementById("testbed").clientWidth;
var title_height = document.getElementById("controls").clientHeight;
var height = window.innerHeight - title_height;

//Clustering positions
var collisionForce = d3.forceCollide(20)
    .iterations(5);
var centeringForce = d3.forceCenter(width / 2,height / 2);

var sim = d3.forceSimulation()
        .force("collide",collisionForce)
        .force("center",centeringForce)
        .on("tick",ticked);

//Tooltip for each listing
var tip = d3.tip()
    .attr("class","tip")
    .direction("n")
    .html(function(d) {
        if (d.media.photo_links.length == 0) {
            return "<div class=\"alert alert-dark\">" +
                "<span>" + d.build.year + " " + d.build.make + " " + d.build.model + "</span>" +
                "<br /><br />" +
                "<span>No image available</span>" +
                "</div>";
        } else {
            var pic_width = Math.min(300,width - 20);
            return "<div class=\"alert alert-dark\">" +
                "<span>" + d.build.year + " " + d.build.make + " " + d.build.model + "</span>" +
                "<br /><br />" +
                "<img " + 
                "width=" + pic_width + " " +
                "src=" + d.media.photo_links[0] + " />" +
                "</div>"
        }
    });

//Main Canvas
var svg = d3.select("#testbed")
    .append("svg")
    .attr("id","canvas")
    .attr("width",width)
    .attr("height",height)
    .call(tip)
    .call(function(d) {
        resize(d,sim)
    });

var listings = [];

//Sample dataset for development purposes
d3.json("../../data/sample.json").then(function(dump) {
    listings = dump.listings;
    nav(listings);
    draw(listings);
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

    var make = d3.set(listings,function(d) {
        return d.build.make;
    }).values().sort();

    var filter_make = d3.select("#filter-make")
        .selectAll("option")
        .data(make)
        .enter();

    filter_make.append("option")
        .attr("value",function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });

    var year = d3.set(listings,function(d) {
        return d.build.year;
    }).values().sort();

    var filter_year = d3.select("#filter-year")
        .selectAll("option")
        .data(year)
        .enter();

    filter_year.append("option")
        .attr("value",function(d) {
            return d;
        })
        .text(function(d) {
            return d;
        });
}

//Draw nodes
function draw(f_listings) {

    console.log(f_listings);

    sim.nodes(d3.values(f_listings));
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
        .attr("r",10)
        .attr("cx",function(d) {
            return d.x;
        })
        .attr("cy",function(d) {
            return d.y;
        })
        .style("fill","steelblue")
        .style("fill-opacity",0)
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
    var selected_make = document.getElementById("filter-make").value;
    if (selected_make != "All Brands") {
        filtered = filtered.filter(function(d) {
            return d.build.make == selected_make;
        });
    }
    var selected_year = document.getElementById("filter-year").value;
    if (selected_year != "All Years") {
        filtered = filtered.filter(function(d) {
            return d.build.year == selected_year;
        });
    }
    draw(filtered);
}
