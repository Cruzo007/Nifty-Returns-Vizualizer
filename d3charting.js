const width = 2500;
const height = 1080;

let file_data
let nifty_type=50
let day_counter=0
let day_limit=0
let yScale
let xScale
let size

let svg = d3
.select("body")
.append("svg")
.attr("height", height)
.attr("width", width);

d3.csv("May_Returns_Sorted.csv").then((data) => {
//console.log(data.slice(0,3))
file_data = data
day_limit=data.length/nifty_type
data_first_day= data.slice(day_counter*nifty_type, (day_counter+1)*nifty_type)

let sectors = Array.from(new Set(data_first_day.map((d) => d.Sector))); //  sectors remain consistent, pass either day's data.
let xCoords = sectors.map((d, i) => 150 + i * 150);
xScale = d3.scaleOrdinal().domain(sectors).range(xCoords);

yScale = d3
    .scaleLinear()
    .domain(d3.extent(data.map((d) => +d["Return"])))   //  pass whole data for domains/scales
    .range([height - 50, 50]);

let color = d3.scaleOrdinal().domain(sectors).range(d3.schemePaired);

let marketcapDomain = d3.extent(data.map((d) => d["Close"]));   // pass whole data for domains/scales
marketcapDomain = marketcapDomain.map((d) => Math.sqrt(Math.abs(d)));
size = d3.scaleLinear().domain(marketcapDomain).range([5, 10]);

var x_axis = d3.axisBottom().scale(xScale);
svg.append("g").call(x_axis);

var y_axis = d3.axisRight().scale(yScale);
svg.append("g").call(y_axis);
//var y_axis = d3.axis

svg
    .selectAll(".circ")
    .data(data_first_day)   // initial circle data should be day 0
    .enter()
    .append("circle")
    .attr("class", "circ")
    .attr("stroke", "black")
    .attr("fill", (d) => color(d.Sector))
    .attr("r", (d) => size(Math.sqrt(Math.abs(d["Close"]))))
    .attr("cx", (d) => xScale(d.Sector))
    .attr("cy", (d) => yScale(d.Return))
    //.attr("r", (d) => size(Math.sqrt(d["Close"])))

    sim(data)
});

function sim(data)
{
    let simulation = d3
    .forceSimulation(data)
    .force(
        "x",
        d3.forceX((d) => {
            return xScale(d.Sector);
        })
        .strength(0.2)
    )
    .force(
        "y",
        d3.forceY(function (d) {
            return yScale(d.Return);
        })
        .strength(1)
    )
    .force(
        "collide",
        d3.forceCollide((d) => {
            return size(Math.sqrt(Math.abs(d["Close"])));
        })
    )
    .alphaDecay(0)
    .alpha(0.3)
    .on("tick", tick);

function tick() {
    d3.selectAll(".circ")
    .attr("cx", (d) => {
        //console.log("cx = ", d.x)
        return d.x;
    })
    .attr("cy", (d) => d.y);
}

let init_decay = setTimeout(function () {
    console.log("start alpha decay");
    simulation.alphaDecay(0.1);
    }, 3000);
}

function increment_day()
{   
    console.log("Current Day", day_counter)
    if(day_counter>=day_limit-1)
    {
        console.log("No further data")
        return
    }
    else
    {
        day_counter=day_counter+1
        data_day_n = file_data.slice(day_counter*nifty_type, (day_counter+1)*nifty_type)
        animate_cricles(data_day_n)
    }
}

function decrement_day()
{
    if(day_counter==0)
    {
        console.log("No Backward data")
        return
    }
    else
    {
        day_counter=day_counter-1
        data_day_n = file_data.slice(day_counter*nifty_type, (day_counter+1)*nifty_type)
        animate_cricles(data_day_n)
    }
}

function animate_cricles(data_new)
{
    var div = document.getElementById("date")
    div.innerHTML="Current Day: " + data_new[0].Date

    d3.selectAll(".circ")
    .data(data_new)
    .transition()
    .duration(2000)
    .attr("cy", (d)=>  yScale(d.Return) )
}

i = setInterval(function(){
    if(day_counter >= day_limit){
          clearInterval(i)
          return
        }
        animate_cricles(file_data.slice(day_counter*nifty_type, (day_counter+1)*nifty_type))
        console.log("Current Loop: ", day_counter)
        day_counter++
      }, 2000)