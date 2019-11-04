# -*- coding: utf-8 -*-
"""
Created on Tue Oct 29 19:56:22 2019

@author: MyPC
"""

import re
import requests
from bs4 import Tag, NavigableString, BeautifulSoup
import pandas as pd
#import csv

#STEP 1: Scrap the overal website to get year and make
URL = "https://www.jdpower.com/cars/consumer-reviews"
r = requests.get(URL)
soup = BeautifulSoup(r.content, 'html5lib')

#Step 1a: Get year list
yearList = []

for yearStr in soup.find(id = "ModelYear"):
    if isinstance(yearStr, Tag):
        if yearStr.text.isdigit():
            yearList.append(yearStr.text)
            
print(yearList)

#Step 1b: Get make list
make_str = "js-consumerReview-make js-consumerReview__fields js-ad-refresh-onchange track-consumer-filter"

makeList = []
for link in soup.find_all("select"):
    if link.get("class") == make_str.split(" "):
        makeList = link.text.split()

makeList = makeList[3:]
print(makeList)

#STEP 2: for each combination of year and make, find rating for each available model
df = pd.DataFrame(columns = ["make","year","model","rating","source"])

#i = 0
for i in range(len(yearList)):
    year = yearList[i]
    
    for m in range(len(makeList)):
        make = makeList[m]
        #year = "2019"
        #make = "lexus"
        
        oneURL = "https://www.jdpower.com/cars/" + year +"/" + make + "/"
        oner = requests.get(oneURL)
        smallsoup = BeautifulSoup(oner.content, 'html5lib')
        
        #print(smallsoup.prettify())
        
        data = oner.text
        if "Oops! Looks like we’re having engine trouble." in data:
            print("skip" + year + make)
            pass
        else:
            startInd = []
            endInd = []
            for m in re.finditer('{"model":"', data):
                startInd.append(m.start())
            
            #First model
            #j = 0
            
            for j in range(len(startInd)):
                try:
                    onemodelStr = data[startInd[j]:startInd[j+1]]
                except:
                    onemodelStr = data[startInd[j]:startInd[j]+round((startInd[len(startInd)-1]-startInd[0])/12)]
                    
                re_model = re.compile(r'''^({"model":")(?P<model>.+?)"''',re.VERBOSE)
                #print(re_model.search(onemodelStr).group('model'))
                try:
                    onemodel = re_model.search(onemodelStr).group('model')
                except:
                    onemodel = -1
                    
                re_rating = re.compile(r'("overall":")(?P<rating>\d\d+)"', re.VERBOSE)
            #print(re_rating.search(onemodelStr).group('rating'))
                try:
                    onerating = re_rating.search(onemodelStr).group('rating')
                except:
                    onerating = -1
            
                df = df.append({"make":make, "year":year, "model": onemodel, "rating": onerating, "source": "jdpower.com"}, ignore_index = True)
            
print(df)

export_csv = df.to_csv(r'D:\NL Docs\Study\Fall 2019\class\CSE 6242 Data Visual Analytics\project\rating.csv',header=True)