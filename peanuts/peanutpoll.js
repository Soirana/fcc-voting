var linksList = [];
var listas = [];
var authorList= [];

var Voter =  React.createClass({
  getInitialState: function(){
      return {
        showOff: true,
        showCreate: false,
        ind: 9999,
        arr: linksList,
        voteValue : "Choose something",
        drawArray: listas,
        author: false,
        user: false,
        private: false
      }
  },

  componentDidMount: function(){
    if (window.location.href !== 'https://soirana-peanuts.herokuapp.com/') {
    var locator = window.location.href.split('/').pop();
    for (var i = 0; i < linksList.length; i++) {
     if (linksList[i] === locator) {
      this.update(i);
      break;
     }
    } 
   }
  }, 
  update: function(index){
      this.setState({
        showOff: false,
        ind: index,
        voteValue : "Choose something"
        });
      self= this;
      $.get( "/poll", { name: linksList[index]} )
          .done(function( data ) {
                listas= data.poll;
                self.setState({drawArray: listas, author: data.name});
                drawPeanut(listas);
       });
    },

  create: function(){
      this.setState({showCreate: !this.state.showCreate});
    },
  handleFocus: function(){
      this.setState({private: !this.state.private});
    },
  turnOff: function(index){
      this.setState({
        showOff: true,
        showCreate: false,
        private: false});
    },
  remove: function(){
      if (this.state.ind !=9999) {
      listas = [];
      $.get( "/remove", { name: linksList[this.state.ind]} )
      linksList.splice(this.state.ind, 1);
      authorList.splice(this.state.ind, 1);
      this.setState({
        showOff: true,
        arr: linksList,
        drawArray: [],
        author: false
        });
    }
    },

  agregate:  function(){
      if (this.state.user){
      self.setState({showOff: false});
      self= this;
      $.get( "/agregate", { user: this.state.user})
          .done(function( data ) {
            drawPeanut(data);
            self.setState({ind: 9999});
          });
        }
    },

  handleCancel:  function(){
      this.setState({showCreate: false});
    },
  handleSave:  function(){
      var changer = {};
      changer.author = this.state.user;
      changer.label = this.refs.title.value;
      changer.poll = this.refs.ingr.value.split(",");
      changer.voters = [];
      this.setState({showCreate: false});
      this.refs.title.value = 'Title';
      this.refs.ingr.value = 'Options (seperate by comma)';
      self= this;
      if (changer.label !== "" && changer.poll.length>1) {
        for (var i = 0; i < changer.poll.length; i++) {
          changer.poll[i] = {name: changer.poll[i], votes: 0};
        }
        $.get( "/create", changer)
            .done(function( data ) {
              if(data.error){
                alert("That name is taken...");
                return;
              } 
              linksList.push(changer.label);
              authorList.push(self.state.user);
              listas = changer.poll;
              self.setState({drawArray: listas, ind: linksList.length-1});
              self.update(linksList.length-1);
        })
      }
    },
  handleTwitter: function(){
      if (this.state.user){
        this.setState({
          user: false,
          showOff: true,
          showCreate: false,
          private: false});
      } else{
      self = this;
        var win         =   window.open('/twitter', "windowname1", 'width=800, height=600'); 
       var logTimer   =   window.setInterval(function() { 
                    if (win.document.body.textContent) {
                        window.clearInterval(logTimer);
                        var url =   win.document.URL;
                        self.setState({user: JSON.parse(win.document.body.textContent).name});
                        win.close();
                    }
                
            }, 500);
    }
  },

  handleText: function(){
      if (this.refs.title.value === 'Title') {
      this.refs.title.value = "";
    }
  },
    handleText1: function(){
      if (this.refs.ingr.value === 'Options (seperate by comma)') {
      this.refs.ingr.value = "";
      }
  },
  handleBlur: function(){
      if (this.refs.title.value === '') {
      this.refs.title.value = "Title";
    }
  },
  handleBlur1: function(){
      if (this.refs.ingr.value === '') {
      this.refs.ingr.value = "Options (seperate by comma)";
      }
  },

  vote: function(){
    self = this;
    $.get( "/votecheck", {user: self.state.user, poll: linksList[self.state.ind]})
            .done(function( data ) {
              if (data.voter) {
                var voteUp = {name: null};
                 if (listas.length>0) {
                  var leng = listas.length
                    for (var i = 0; i < leng; i++) {
                      if (listas[i].name === self.state.voteValue){
                          listas[i].votes++;
                          voteUp["name"] =listas[i].name;
                          voteUp['poll']= linksList[self.state.ind];
                          break;
                      }
                    }
                    var checker = null;
                    if (i===leng){
                      checker = prompt("Please enter your option", listas[0].name);
                    }
                    if (checker) {
                    listas.push({name: checker, votes:1});
                    voteUp["name"] =checker
                    voteUp['poll']= linksList[this.state.ind];
                    }
                    if (voteUp.name !== null){
                        $.get( "/vote", {old: voteUp, voter: self.state.user});
                        self.setState({drawArray: listas});
                        drawPeanut(listas);
                    }       
                }
                return;

             }else{
                alert("You voted already...");
              }

            });

      
  },
  handleChange: function(e){
      this.setState({voteValue: e.target.value});
  },
  render: function(){
      var adder,
        classText = "sponge ",
        svgName = "",
        header,
        adder,
        creator,
        userClass = "invisible",
        logText,
        privText,
        privClass,
        removeClass = "";

      if (this.state.author!== this.state.user){
        removeClass = "invisible";
      }

      if (this.state.private){
          privText = "All polls";
          privClass = "invisible";
      } else{
        privText = "My polls";
        privClass = "";
      }

      if (this.state.user){
          userClass = "";
          logText = "Log out";
      }else{
          logText = "Twitter log in";
      }
        
      if (this.state.drawArray.length>0) {
        adder= this.state.drawArray.map((listValue) =>{
          return <option value={listValue.name}>{listValue.name}</option>
        });
      }
      if (this.state.showCreate) {
            creator = <div>
              <div className = {userClass}>
                <input ref = "title" className = 'linker white' onFocus = {this.handleText}
                onBlur= {this.handleBlur} defaultValue = "Title"></input>
                
                <textarea ref = "ingr" className = 'linker white' onFocus = {this.handleText1}
                 onBlur= {this.handleBlur1} defaultValue = "Options (seperate by comma)"></textarea>
                
              </div>
              <div >
                <button onClick = {this.handleSave} >Save</button>
                <button onClick = {this.handleCancel} >Cancel</button>
              </div>
            </div>
      }
      if (this.state.showOff) {
        svgName = "invisible";
        classText +=  "long";
        header = <div className = "header"><h3>Available polls</h3></div>
      } else if(this.state.ind !== 9999){
        header = <div className = "header"><h3>Poll by {this.state.author}<br/>
        {linksList[this.state.ind]}</h3></div>
        classText +=  "short";
      } else{
        header = <div className = "header"><h3>Poll by {this.state.author}<br/>
        Agregate</h3></div>
        classText +=  "short";
      }
      return(<div>
        <button className = "" onClick = {this.handleTwitter}>{logText}</button>
        {header}
        <div className = "wrap">
        <div className= {classText}>
        <button className = "linker" onClick ={this.turnOff}>Home</button>
        <button className = {userClass +" linker"} onClick ={this.create}>Create new poll</button>
        {creator}
        <button className = {userClass +" linker"} onClick ={this.handleFocus}>{privText}</button>
        <button className = {userClass +" linker"} onClick ={this.agregate}>My agregate</button>
        <button className= {userClass+ " linker red " + svgName + " " + removeClass} onClick ={this.remove}>Remove poll</button>
        <button className= {"linker " + svgName} onClick ={this.vote}>Vote</button>
        <select id="optioner" ref= "selector" value= {this.state.voteValue} className = {"linker " + svgName} onChange ={this.handleChange}>
        {adder}
          <option value="Choose something">Choose something</option>
        </select> 

        {this.state.arr.map((listValue, index)=>{
          var pollText = "linker middler";
          if (this.state.private && authorList[index]!== this.state.user){
            pollText += " invisible";
          }
          
          return <div>
                    <button className = {pollText} onClick ={()=> this.update(index)}>{listValue}</button>
                 </div>
            })}
        

        </div>
        <svg className= {svgName}></svg>
        
        </div>
        <br/>
        <a target= "blank" href={"https://twitter.com/intent/tweet/?text= Poll: https://soirana-peanuts.herokuapp.com/"+ linksList[this.state.ind]} data-size="large">
      <button type="button" className ={userClass+" "+ svgName}>Tweet this poll!</button></a>   
        <p>
          This "fcc-voting" app was built by <a href="https://www.freecodecamp.com/soirana">Soirana</a><br/>
        for the <a href="https://www.freecodecamp.com/challenges/build-a-voting-app">Free Code Camp task</a><br/>
        <a href = "https://github.com/Soirana/fcc-voting">Github repository</a>
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
          linksList = data.links;
          authorList = data.authors;
          ReactDOM.render(<Voter></Voter>,document.getElementById('box'));
      }
      
  });

});



