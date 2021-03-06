$(document).ready(function() {
  var radius;
  var zipCode;

  var granimInstance = new Granim({
    element: "#canvas-image-blending",
    direction: "diagonal",
    isPausedWhenNotInView: true,
    image: {
      source: "assets/images/mountain2.jpg",
      blendingMode: "hue"
    },
    states: {
      "default-state": {
        gradients: [
          ["#29323c", "#485563"],
          ["#FF6B6B", "#556270"],
          ["#80d3fe", "#7ea0c4"],
          ["#f0ab51", "#eceba3"]
        ],
        transitionSpeed: 7000
      }
    }
  });

  // array used in materials drop-down. IDs are referencing material IDs from Earth911 API
  var materialsArr = [
    { name: "Air-Conditioners", id: 591 },
    { name: "Aluminum-Cans", id: 70 },
    { name: "Asphalt", id: 212 },
    { name: "Batteries", id: 104 },
    { name: "Cardboard", id: 40 },
    { name: "Construction-Debris", id: 385 },
    { name: "Latex-Paint", id: 418 },
    { name: "Adult-Toys", id: 353 },
    { name: "Mattresses", id: 226 },
    { name: "Paint-Thinners", id: 191 },
    { name: "Plastic-Bottle", id: 60 },
    { name: "Porcelain-Products", id: 214 },
    { name: "Sand", id: 386 },
    { name: "Small-Appliances", id: 362 },
    { name: "Tires", id: 5 },
    { name: "Truck-Tires", id: 633 },
    { name: "Vehicles", id: 267 },
    { name: "Washer/Dryers", id: 573 }
  ];

  materialsArr.forEach(function(element) {
    var optionTag = $("<option>");
    optionTag.text(element.name);
    optionTag.attr("id", element.name);
    optionTag.attr("materialId", element.id);
    $("#materials").append(optionTag);
  });

  // array used in radius drop-down
  var radiusArr = ["5", "10", "15", "25", "50"];

  radiusArr.forEach(function(radiusChoice) {
    var optionTag = $("<option>");
    optionTag.text(radiusChoice);
    $("#radius").append(optionTag);
  });

  // Earth911 API call
  var latitude, longitude;
  var earthQuery = function(materialIdfromPage) {
    var apiKey = "3fb6e10a90808f0d";
    var queryURL =
      "https://cors-anywhere.herokuapp.com/https://api.earth911.com/earth911.getPostalData?postal_code=" +
      zipCode +
      "&country=US&api_key=" +
      apiKey;

    console.log(queryURL);

    $.ajax({
      method: "GET",
      url: queryURL
    }).then(function(response) {
      console.log(response);
      var parsedResponse = JSON.parse(response);
      latitude = parsedResponse.result.latitude;
      longitude = parsedResponse.result.longitude;
      city = parsedResponse.result.city;
      console.log(
        "https://cors-anywhere.herokuapp.com/https://api.earth911.com/earth911.getLocationDetails?api_key=3fb6e10a90808f0d" +
          "&latitude=" +
          latitude +
          "&longitude=" +
          longitude +
          "&material_id=" +
          materialIdfromPage
      );
      $.ajax({
        method: "GET",
        url:
          "https://cors-anywhere.herokuapp.com/https://api.earth911.com/earth911.searchLocations?api_key=3fb6e10a90808f0d" +
          "&latitude=" +
          latitude +
          "&longitude=" +
          longitude +
          "&material_id=" +
          materialIdfromPage +
          "&max_distance=" +
          radius
      }).then(function(resultA) {
        //logic for actual location data
        console.log(resultA);
        var resultB = JSON.parse(resultA);
        console.log(resultB);
        console.log(resultB.result[0].longitude);
        console.log(resultB.result[0].latitude);
        var longitude = resultB.result[0].longitude;
        var latitude = resultB.result[0].latitude;
        // sends longitude, latitude, and resultB.results to our map
        drawMap(longitude, latitude, resultB.result);
        // creates for loop displaying name and distance
        if (typeof resultB.result !== typeof undefined) {
          for (let i = 0; i < resultB.result.length; i++) {
            let locationId = resultB.result[i].location_id;
            console.log("LOCATION ID------>", locationId);
            // ajax call for address and phone number
            $.ajax({
              method: "GET",
              url:
                "https://cors-anywhere.herokuapp.com/https://api.earth911.com/earth911.getLocationDetails?api_key=3fb6e10a90808f0d" +
                "&location_id=" +
                locationId

              // appends address
            }).then(function(locationResult) {
              var resultObj = JSON.parse(locationResult);
              var phone;
              var address;

              var resultDiv = $('<div id="facilities">');
              resultDiv
                .append("Name: " + resultB.result[i].description)
                .append($("<br>"));
              resultDiv
                .append("Distance: " + resultB.result[i].distance)
                .append($("<br>"));

              console.log("location ID------->", locationId);

              // appends address
              if (
                typeof resultObj.result[locationId].address !== typeof undefined
              ) {
                address =
                  resultObj.result[locationId].address +
                  " " +
                  resultObj.result[locationId].city;
                console.log("address--------->", address);
                resultDiv.append("Address: " + address + "<br>");
              }
              // appends phone number
              if (
                typeof resultObj.result[locationId].phone !== typeof undefined
              ) {
                phone = resultObj.result[locationId].phone;
                console.log("phone---------->", phone);
                resultDiv.append("Phone: " + phone);
              }

              // displays results
              $("#list").append(resultDiv);
              $("#list").append($("<br>"));
            });
          }
        }
      });
    });
  };

  // earthQuery();
  $("#submit").click(function(event) {
    event.preventDefault();
    var val = $("#materials").val();
    var option = $("#" + val);
    var materialID = option.attr("materialId");
    console.log(materialID);
    zipCode = $("#inlineFormInputName2").val();
    console.log("zipCode====", zipCode);
    earthQuery(materialID);
    $("#inlineFormInputName2").val("");
    radius = $("#radius").val();
  });

  // Initialize and add the map
  function drawMap(longitude, latitude, markers) {
    //     // The location of target destination
    var targetLocation = {
      lat: latitude,
      lng: longitude
    };
    //     // The map, centered at target locations
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: targetLocation
    });
    //     // The marker, positioned at target locations
    var marker = new google.maps.Marker({
      position: targetLocation,
      map: map
    });
    // loops through 'markers' array
    for (var i = 0; i < markers.length; i++) {
      var marker = new google.maps.Marker({
        position: { lat: markers[i].latitude, lng: markers[i].longitude },
        map: map
      });
    }
  }
  // Initialize and add the map
});

// Inital map location
function initMap(longitude, latitude) {
  // The location of target destination
  var targetLocation = {
    lat: -93.2980409363637,
    lng: 44.830624313775154
  };
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: targetLocation
  });
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({
    position: targetLocation,
    map: map
  });
}
