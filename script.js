document.getElementById('waterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const apiKey = "CZj1eV4FWz13kRyBQAOykWTp7CaIFjbyT9IJMjq2ax7U";
    const ph = parseFloat(document.getElementById('ph').value);
    const hardness = parseFloat(document.getElementById('hardness').value);
    const solids = parseFloat(document.getElementById('solids').value);
    const chloramines = parseFloat(document.getElementById('chloramines').value);
    const sulfate = parseFloat(document.getElementById('sulfate').value);
    const conductivity = parseFloat(document.getElementById('conductivity').value);
    const organicCarbon = parseFloat(document.getElementById('organic_carbon').value);
    const trihalomethanes = parseFloat(document.getElementById('trihalomethanes').value);
    const turbidity = parseFloat(document.getElementById('turbidity').value);

    const payload = JSON.stringify({
        "input_data": [{
            "fields": ["ph", "hardness", "solids", "chloramines", "sulfate", "conductivity", "organic_carbon", "trihalomethanes", "turbidity"],
            "values": [[ph, hardness, solids, chloramines, sulfate, conductivity, organicCarbon, trihalomethanes, turbidity]]
        }]
    });

    function getToken(errorCallback, loadCallback) {
        const req = new XMLHttpRequest();
        req.addEventListener("load", loadCallback);
        req.addEventListener("error", errorCallback);
        req.open("POST", "https://iam.cloud.ibm.com/identity/token");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.setRequestHeader("Accept", "application/json");
        req.send("grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=" + apiKey);
    }

    function apiPost(scoring_url, token, payload, loadCallback, errorCallback){
        const oReq = new XMLHttpRequest();
        oReq.addEventListener("load", loadCallback);
        oReq.addEventListener("error", errorCallback);
        oReq.open("POST", scoring_url);
        oReq.setRequestHeader("Accept", "application/json");
        oReq.setRequestHeader("Authorization", "Bearer " + token);
        oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        oReq.send(payload);
    }

    getToken((err) => console.log(err), function () {
        let tokenResponse;
        try {
            tokenResponse = JSON.parse(this.responseText);
        } catch(ex) {
            console.error("Error parsing token response:", ex);
            return;
        }
        const scoring_url = "https://private.us-south.ml.cloud.ibm.com/ml/v4/deployments/potable/predictions?version=2021-05-01";
        apiPost(scoring_url, tokenResponse.access_token, payload, function (resp) {
            let parsedPostResponse;
            try {
                parsedPostResponse = JSON.parse(this.responseText);
            } catch (ex) {
                console.error("Error parsing scoring response:", ex);
                return;
            }
            const resultDiv = document.getElementById('result');
            if (parsedPostResponse && parsedPostResponse.predictions && parsedPostResponse.predictions[0].values) {
                const prediction = parsedPostResponse.predictions[0].values[0][0];
                if (prediction === 1) {
                    resultDiv.textContent = "The water is potable.";
                    resultDiv.style.color = "green";
                } else {
                    resultDiv.textContent = "The water is not potable.";
                    resultDiv.style.color = "red";
                }
            } else {
                resultDiv.textContent = "Error in prediction response.";
                resultDiv.style.color = "red";
            }
        }, function (error) {
            console.log(error);
        });
    });
});
