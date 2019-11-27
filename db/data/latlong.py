import csv

cities = []

with open("craigslist_domains.csv") as csv:
    for line in csv:
        domain = csv.readline()
        domain = domain.strip("\n").split(",")
        cities.append(domain[2])

zips = {}

with open("us-zip-code-latitude-and-longitude.csv") as csv:
    for line in csv:
        zip_ = csv.readline()
        zip_ = zip_.strip("\n").split(";")
        city = zip_[1].lower().replace(" ","")
        zips[city] = [float(zip_[3]),float(zip_[4])]

latlong = []

for city in cities:
    if city in zips:
        latlong.append(zips[city])
    else:
        print("{} not in list".format(city))
        found = False
        while not found:
            name = input("Fixed name?")
            if name in zips:
                latlong.append(zips[name])
                found = True

print(latlong)

with open("latlong.csv","w+") as csv:
    for city in latlong:
        csv.write("{},{}".format(city[0],city[1]))
