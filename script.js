function queryURL() {
  var queryU = "";
  var querySearch = "";
}
console.log("start");

// prelim submit function
$("#userForm").on("submit", function (event) {
  event.preventDefault();
  console.log("submitted");
  var city = $("#textarea1").val().trim();
  console.log(city);
  if (city == "") {
    return;
  }
});
