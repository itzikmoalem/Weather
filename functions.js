var formWeather = (function () {

    //=== Private Members ===
    var ErrorList = [];
    var List = [];

    var errorHTML = "";

    // this is the object we want to return (what we want public under our namespace)
    // we're going to add methods and a class definition
    var publicData = {};

    //=== Public Methods ===

    //add error func
    publicData.addError = function (Reason) {
        ErrorList.push(Reason);
    }

    // this function make a list of errors in html
    publicData.buildErrorHTML = function () {
        errorHTML = "<div style='background-color: lightpink'><h5 style='padding: 2%'> " +
            "Please correct the following errors:</h5>" + "<ul>";

        for (let i=0; i<ErrorList.length; i++) {
            errorHTML += "<li style='background-color: #FFDEE0'>" + ErrorList[i] + "</li>";
        }
        errorHTML += "</ul></div>";
    }

    publicData.getErrorHTML = function () {
        return errorHTML;
    }

    publicData.clearErrors = function () {
        ErrorList = [];
        errorHTML = "";
    }

    publicData.getErrorLength = function (){
        return ErrorList.length;
    }

    // this function make a list of locations in html
    publicData.makeHTML =function (temp, place) {
        let list = "";
        let newPlace = document.createElement("li");
        newPlace.id = temp;
        list +=  place + "<span class=\"close\">&times;</span>";
        newPlace.innerHTML = list;
        document.getElementById("mylist").appendChild(newPlace);
    }

    // add city to list
    publicData.addToList = function (place) {
        List.push(place);
    }

    publicData.getListLength = function () {
        return List.length;
    }

    // delete location from array
    publicData.DelFromList = function (i) {

        // to get the city name
        let str2 = i.substr(0, i.length - 1)

        // delete from array
        for (let j=0; j<List.length; j++){
            if (str2 === List[j].locname) {
                List.splice(j, j + 1);
            }
        }
    }

    return  publicData;
})();

// the user has been added a new city
function Added() {

    formWeather.clearErrors();
    document.getElementById("errors").innerHTML = formWeather.getErrorHTML();

    Validation();

    // there is a problem with the input
    if (formWeather.getErrorLength() > 0) {
        GenericErrorEdit();
    }

    // add a new location
    else if (formWeather.getErrorLength() === 0) {

        // clear errors
        formWeather.clearErrors();
        document.getElementById("errors").innerHTML = formWeather.getErrorHTML();

        // create element
        CreateElement();

        // make listen
        ListeningDeleteToList();
    }
}

// this function listen to the city's list delete buttons
function ListeningDeleteToList() {

    let closebtns = document.getElementsByClassName("close");
    let i;

    // add listener event to delete button [x]
    for (i = 0; i < closebtns.length; i++) {
        closebtns[i].addEventListener("click", function() {
            this.parentElement.style.display = 'none';
            formWeather.DelFromList(this.parentElement.innerText);  // delete on array
        });
    }

    if (closebtns.length === 0) {
        document.querySelector("#weater").innerHTML = "";
    }
}

// this function create an city element on the list
function CreateElement() {

    // get the inputs from form
    let CityName = document.getElementById("addForm").elements.namedItem("inputCity").value;
    let latitude = document.getElementById("addForm").elements.namedItem("inputLatitude").value;
    let longitude = document.getElementById("addForm").elements.namedItem("inputLongitude").value;

    // make an object and push to list array
    let place = {locname:CityName, lati:latitude, longi:longitude};
    formWeather.addToList(place);

    let temp = "id" + Date.now();

    // build HTML and appaned child
    formWeather.makeHTML(temp, CityName);

    // listener event
    document.getElementById(temp).addEventListener('click', function () {
        ShowWeater(CityName, latitude, longitude)});
}

// this function use Json for contact with site and get data about the user choice
function ShowWeater(name,latitude,longitude) {

    let APIurl = "http://www.7timer.info/bin/api.pl?lon=" +  longitude + "&lat=" + latitude + "&product=civillight&output=json";
    let date = new Date();

    console.log(name + ":" + latitude + "," + longitude);

    // the function that triggers an Ajax call
    fetch(APIurl)
        .then(
            function (response) {

                //handle the error
                if (response.status !== 200) {
                    document.querySelector("#weater").innerHTML = 'Cannot load the weather rigth now, please comeback later. Status Code: ' +
                        response.status;
                    return;
                }

                // Examine the response and generate the HTML
                response.json().then(function (data) {
                    let day=0;
                    var html = "<h3>" + name + "</h3>" + "<h6> Longitude: " + longitude + " , Latitude: " + latitude + "</h6><br>";

                    // head of table to html
                    html += "<table class=\"table table-striped\" style='padding-left: 4%'>\n" +
                        "  <thead>\n" +
                        "    <tr>\n" +
                        "      <th scope=\"col\">Date</th>\n" +
                        "      <th scope=\"col\">Temperature</th>\n" +
                        "      <th scope=\"col\">Wind Speed</th>\n" +
                        "      <th scope=\"col\">Weather</th>\n" +
                        "    </tr>\n" +
                        "  </thead>\n";

                    // get the all 7 days from ajax
                    for (let i in data.dataseries) {

                        // update date
                        let currectDate = (date.getDate() + day) + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

                        // update temperature
                        let tempeture = "";
                        for (let j in data.dataseries[i].temp2m) {

                            tempeture += data.dataseries[i].temp2m[j] += "°";
                            if (j === "max")
                                tempeture += " - ";
                        }

                        //update wind
                        let wind = getTextWind(data.dataseries[i].wind10m_max);

                        // update weather
                        let weather = data.dataseries[i].weather;
                        let weatherIcon = getWeatherIcon(weather);
                        weather = getWeatherText(weather);

                        // generic function to add a day with update values from ajax
                        html += addDayWeater(currectDate, tempeture, wind, weather, weatherIcon);

                        day++;
                    }

                    html += "</tbody>" + "</table>";

                    // display the HTML
                    document.querySelector("#weater").innerHTML = html;
                });
            })
        .catch(function (err) {
            console.log('Fetch Error :', err);
            document.querySelector("#weater").innerHTML = "Looks like there was a problem!";
            document.querySelector("#weater").innerHTML += "";
        });
}

// generic function to add a day with update values from ajax
function addDayWeater(currectDate, tempeture, wind, weather, weatherIcon) {

    let temp = "";

    temp +=
        "<tr>" +
            "<th scope=\"row\">"+ currectDate + "</th>" +
            "<td>&emsp;" + tempeture + "</td>"+
            "<td style=\"padding-left: 2%\">" + wind + "</td>"+
            "<td><img src='" + weatherIcon + "'" + "alt=\"icon\"><br><h20>" + weather + "</h20></td>" +
        "</tr>\n";

    return temp;
}

// this function convert the int value of wind to text and km/s
function getTextWind(num) {
    switch (num) {
        case 1:
            return "";
        case 2:
            return ("1-12 <b>km/s</b>" + "<br>(light)");
        case 3:
            return ("12-18 <b>km/s</b>" + "<br>(moderate)");
        case 4:
            return ("18-28 <b>km/s</b>" + "<br>(fresh)");
        case 5:
            return ("28-61 <b>km/s</b>" + "<br>(strong)");
        case 6:
            return ("61-88 <b>km/s</b>" + "<br>(gale)");
        case 7:
            return ("88-117 <b>km/s</b>" + "<br>(storm)");
        case 8:
            return ("over 117 <b>km/s</b>" + "<br>(hurricane)");
        default:
            return "Error";
    }
}

// this function convert the weather data to icons
function getWeatherIcon(str) {
    switch (str) {
        case "clear":
            return "icons/clear.png";
        case "pcloudy":
            return "icons/pcloudy.png";
        case "cloudy":
            return "icons/cloudy.png";
        case "mcloudy":
            return "icons/cloudy.png";
        case "vcloudy":
            return "icons/vcloudy.png";
        case "foggy":
            return "icons/foggy.png";
        case "ishower":
            return "icons/ishower.png";
        case "rain":
            return "icons/rain.png";
        case "lightrain":
            return "icons/lightrain.png";
        case "oshower":
            return "icons/oshower.png";
        case "mixed":
            return "icons/mixed.png";
        case "thunderstorm":
            return "icons/thunderstorm.png";
        case "windy":
            return "icons/windy.png";
        case "snow":
            return "icons/snow.png";
        case "humid":
            return "icons/humid.png";
        case "lightsnow":
            return "icons/lightsnow.png";
        case "rainsnow":
            return "icons/mixed.png";

        default:
            return "Error";
    }
}

// this function convert the weather data to text
function getWeatherText(str) {
    switch (str) {
        case "clear":
            return "Clear";
        case "pcloudy":
            return "Partly Cloudy";
        case "cloudy":
            return "Cloudy";
        case "mcloudy":
            return "Cloudy";
        case "vcloudy":
            return "Very Cloudy";
        case "foggy":
            return "Foggy";
        case "ishower":
            return "Isolated Showers";
        case "rain":
            return "Rain";
        case "lightrain":
            return "Light Rain";
        case "oshower":
            return "Occasional Showers";
        case "mixed":
            return "Mixed";
        case "thunderstorm":
            return "Thunderstorm";
        case "windy":
            return "Windy";
        case "snow":
            return "Snow";
        case "humid":
            return "Humid";
        case "lightsnow":
            return "Light Snow";
        case "rainsnow":
            return "Rain & Snow";

        default:
            return "Error";
    }
}


// this generic function gets a reason of error as string and add the error into ErrorList and priny HTML
function GenericErrorEdit() {

    formWeather.buildErrorHTML();
    document.getElementById("errors").innerHTML = formWeather.getErrorHTML();
}

// this function check validation of the input form
function Validation() {

    // check that the city is un-empty
    let CityName = document.getElementById("addForm").elements.namedItem("inputCity").value;
    if (CityName === "") {
        formWeather.addError("City Name is Missing");
    }

    // check that the latitude is un-empty
    let Latitude = document.getElementById("addForm").elements.namedItem("inputLatitude").value;
    if (Latitude === "") {
        formWeather.addError("Please enter Latitude field");
    }
    else {
        if (!isNumeric(Latitude))
            formWeather.addError("Unreadable Latitude, Please enter a number");
    }

    // check that the longitude is un-empty
    let Longitude = document.getElementById("addForm").elements.namedItem("inputLongitude").value;
    if (Longitude === "") {
        formWeather.addError("Please enter Longitude field");
    }
    else {
        if (!isNumeric(Longitude))
            formWeather.addError("Unreadable Longitude, Please enter a number");
    }

    // check the range of the latitude & longitude
    if (Longitude > 180 || Longitude < -180)
        formWeather.addError("Longitude range can be [-180,180]");

    if (Latitude > 90 || Latitude < -90)
        formWeather.addError("Latitude range can be [-90,90]");

}

// is Numeric function
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}