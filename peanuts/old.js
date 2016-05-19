



var name = "Soirana";
var linksList = [];
var listas = [];



var Voter =  React.createClass({
  getInitialState: function(){
      return {
        showOff: true,
        ind: 9999,
        arr: linksList,
        voteValue : "Choose something",
        drawArray: listas
      }
    },
    update: function(index){
      this.setState({
        showOff: false,
        ind: index,
        voteValue : "Choose something"
        });
      $.get( "/poll", { name: linksList[index]} )
          .done(function( data ) {
                listas= data;
                drawPeanut(data);
       });
      
      
    },
    turnOff: function(index){
      this.setState({showOff: true});
    },
    remove: function(){
      listas = [];
      linksList.splice(this.state.ind, 1);
      this.setState({
        showOff: true,
        arr: linksList
        });
    },
    vote: function(){
      if (listas.length>0) {
        var leng = listas.length
        for (var i = 0; i < leng; i++) {
          if (listas[i].name === this.state.voteValue){
            listas[i].votes++;

            break;
          }
        }
        var checker = null;
        if (i===leng){
          checker = prompt("Please enter your option", listas[0].name);
        }
        if (checker) {
          listas.push({name: checker, votes:1});
        }
      drawPeanut(listas);       
      }
      return;
    },
    handleChange: function(e){
      this.setState({voteValue: e.target.value});
    },
    render: function(){
      var adder,
        classText = "sponge ",
        svgName = "",
        header,
        adder;
      if (listas.length>0) {
        adder= listas.map((listValue) =>{
          return <option value={listValue.name}>{listValue.name}</option>
        });
      }
      if (this.state.showOff) {
        svgName = "invisible";
        classText +=  "long";
        header = <div className = "header"><h3>Available polls</h3></div>
      } else{
        header = <div className = "header"><h3>Poll by {name}</h3></div>
        classText +=  "short";
      }
      return(<div>
        {header}
        <div className = "wrap">
        <div className= {classText}>
        {this.state.arr.map((listValue, index)=>{
          return <div>
           <button className = "linker" onClick ={()=> this.update(index)}>{listValue}</button>
           </div>
        })}
        <button className = "linker" onClick ={this.turnOff}>Home</button>
        <button className= {"linker " + svgName} onClick ={this.remove}>Remove poll</button>
        <button className= {"linker " + svgName} onClick ={this.vote}>Vote</button>
        
        <select id="optioner" ref= "selector" value= {this.state.voteValue} className = {"linker " + svgName} onChange ={this.handleChange}>
        {adder}
          <option value="Choose something">Choose something</option>
        </select> 
        </div>
        <svg className= {svgName}></svg>
        
        </div>
        <p>
          This "fcc-voting" app was built by <a href="https://www.freecodecamp.com/soirana">Soirana</a><br/>
        for the <a href="https://www.freecodecamp.com/challenges/build-a-voting-app">Free Code Camp task</a><br/>
        <a href = "">Github repository</a>
        </p>
        </div>
        )
    }
});




$(document).ready(function() {
  $.ajax({
      url: '/initial',
      method: "GET",
      success: function(data) {
          linksList = data;
          ReactDOM.render(<Voter></Voter>,document.getElementById('box'));
      }
      
  });
});


