//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const { name } = require("ejs");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to db

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB" );

//create a shema

const itemsShema = {
  name : String
}


const Item = mongoose.model("item",itemsShema);


//create the items
const doc1 = new Item({
  name : "Buy Food"
});

const doc2 = new Item({
  name : "Cook Food"
});

const doc3 = new Item({
  name : "Eat Food"
});


const defaultarray = [doc1 , doc2 , doc3];

///listshema

const listShema = {
  name : String ,
  items : [itemsShema] 
}


const List = mongoose.model("List",listShema);






app.get("/", function(req, res) {
  // find items
  Item.find( {},function (err, founditems){
    if (founditems.length == 0) {
            //insert them to db if empty
      Item.insertMany( defaultarray , function (err) {
      if (err) {
          console.log(err);
       } else {
          console.log("Succes");
       }  
      })
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: founditems});

    }
  })
});





app.get("/:customlistname", function(req,res){
  const nameList = _.capitalize(req.params.customlistname); 
  console.log(nameList);
  List.findOne({name : nameList} ,function (err,result) {
    if (!err) {
      if (!result) {

        console.log("doesnt exist");

        const list = new List({
          name :  nameList,
          items : defaultarray
        })

        list.save();
        res.redirect("/"+nameList)
      }
      else {
        res.render("list", {listTitle: nameList , newListItems: result.items});
      }

    }


  })

});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item  = new Item ({
    name : itemName
  });

  if ( listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName} , function (err,foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);

    })
  }

});



app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete", function (req,res) {
  const deletedId = req.body.checkbox;
  const listName = req.body.nameList;

  console.log(deletedId);
  if (listName == "Today") {
    Item.findByIdAndRemove( deletedId , function (err) {
      if (!err) {
        console.log("Succefully deleted item");
        res.redirect("/");
      }
      else {
        console.log(err);
      }
    });


  } else {
    List.findOneAndUpdate({ name: listName},{$pull : { items : { _id: deletedId}}},function (err,result) {
      if (!err) {
        res.redirect("/"+listName);
      }
      else {
        console.log(err);
      }
    })
 
  }
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
