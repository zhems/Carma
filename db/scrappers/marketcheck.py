import requests
import time
import json

listings = []

try :
    with open("latlong.csv") as csv:
        for line in csv:
            coords = csv.readline().split(",")
            url = 'http://api.marketcheck.com/v1/search?api_key=oG1gTKvIs4P8WUgpEzFuNRh8GVYD8z0B&latitude={}&longitude={}&radius=50&car_type=used&start=0&rows=50'.format(coords[0],coords[1])
            headers = {
              'Host': 'marketcheck-prod.apigee.net'
              }
            print("Requesting for {} {}".format(coords[0],coords[1]))
            response = requests.request('GET', url, headers = headers, allow_redirects=False)
            while response.status_code != 200:
                print("Recieved {} code, waiting 2 seconds".format(response.status_code))
                time.sleep(2)
                response = requests.request('GET', url, headers = headers, allow_redirects=False)

            payload = json.loads(response.text)
            listings.extend(payload["listings"])
            time.sleep(2)

except:
    out = {}
    with open("listings.json","w+") as outfile:
        out["listings"] = listings
        json.dump(out,outfile)

out = {}
with open("listings2.json","w+") as outfile:
    out["listings"] = listings
    json.dump(out,outfile)
