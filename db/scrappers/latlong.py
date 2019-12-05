import csv

cities = []

with open("craigslist_domains.csv") as csv_file:
    csv_reader = csv.reader(csv_file,delimiter=",")
    next(csv_reader,None)
    for domain in csv_reader:
        cities.append(domain[2])

zips = {}

with open("us-zip-code-latitude-and-longitude.csv") as csv_file:
    csv_reader = csv.reader(csv_file,delimiter=";")
    next(csv_reader,None)
    for zip_ in csv_reader:
        city = zip_[1].lower().replace(" ","").replace(".","")
        zips[city] = [city,float(zip_[3]),float(zip_[4])]

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

with open("latlong_v2.csv","w+") as csv:
    for city in latlong:
        csv.write("{},{},{}\n".format(city[0],city[1],city[2]))
