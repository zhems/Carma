import json

cars = {}
final = []
missing = {}

with open("us_car_models.csv") as csv:
    for line in csv:
        car = csv.readline().split(",")
        models = cars.get(car[1].strip(),set())
        models.add(car[2].strip())
        cars[car[1].strip()] = models

try:
    with open("listings.json") as dump:
        payload = json.loads(dump.read())
        listings = payload["listings"]
        for listing in listings:
            try:
                while listing["build"]["make"] not in cars.keys():
                    if listing["build"]["make"] in missing:
                        listing["build"]["make"] = missing[listing["build"]["make"]] 
                    else:
                        print(cars.keys())
                        fixed = input("Make {} not found\n".format(listing["build"]["make"]))
                        missing[listing["build"]["make"]] = fixed
                        listing["build"]["make"] = fixed
                print("testing {} {}".format(listing["build"]["make"],listing["build"]["model"]))
                models = cars.get(listing["build"]["make"],"Make not found!")
                while listing["build"]["model"] not in models:
                    if listing["build"]["model"] in missing:
                        listing["build"]["model"] = missing[listing["build"]["model"]] 
                    else:
                        print(models)
                        fixed = input("Model not found for {} {}\n".format(listing["build"]["make"],listing["build"]["model"]))
                        missing[listing["build"]["model"]] = fixed
                        listing["build"]["model"] = fixed
                final.append(listing)
            except:
                pass
except:
    with open("cleaning_data","w+") as outfile:
        for item in missing:
            outfile.write("{},{}\n".format(item,missing[item]))

with open("cleaned_listings.json","w+") as outfile:
    out = {"listings": final}
    outfile.write(json.dumps(out))

with open("cleaning_data","w+") as outfile:
    for item in missing:
        outfile.write("{},{}\n".format(item,missing[item]))




