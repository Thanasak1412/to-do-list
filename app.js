const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require("./date");
const _ = require("lodash");

const dateTitle = date.getDate();

const app = express();

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Homework",
});

const item2 = new Item({
  name: "Read a book",
});

const item3 = new Item({
  name: "Cook food",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  item: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  Item.find({}, (err, item) => {
    if (item.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Default todo Successfully inserted");
        }
      });
      res.redirect("/");
    } else if (err) {
      console.log(err);
    } else {
      setInterval(() => {
        date.getDate();
      }, 1000);
      res.render("list", { listTitle: date.getDate(), newItems: item });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({ name: customListName }, (err, list) => {
    if (!err) {
      if (!list) {
        const list = new List({
          name: customListName,
          item: defaultItems,
        });
        list.save();
        res.redirect(`/${customListName}`);
      } else {
        res.render("list", { listTitle: list.name, newItems: list.item });
      }
    }
  });
});

app.post("/", (req, res) => {
  const { newItem, list } = req.body;

  const item = new Item({
    name: newItem,
  });

  if (list === dateTitle) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: list }, (err, foundList) => {
      if (err) {
        console.log(err);
      } else {
        foundList.item.push(item);
        foundList.save();
        res.redirect(`/${list}`);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const { checkItemId, list } = req.body;

  if (list === dateTitle) {
    Item.findByIdAndRemove(checkItemId, (err, { name }) => {
      if (!err) {
        console.log(`${name} Successfully deleted`);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: list },
      { $pull: { item: { _id: checkItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect(`/${list}`);
        }
      }
    );
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
