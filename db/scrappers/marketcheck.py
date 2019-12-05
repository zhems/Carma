import requests
import time
import json
import sys

listings = []

try :
    with open("latlong.csv") as csv:
        for line in csv:
            coords = csv.readline().split(",")
            url = 'http://api.marketcheck.com/v1/search?api_key={}&latitude={}&longitude={}&radius=50&car_type=used&start=0&rows=50'.format(sys.argv[1],coords[0],coords[1])
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
with open("listings.json","w+") as outfile:
    out["listings"] = listings
    json.dump(out,outfile)
