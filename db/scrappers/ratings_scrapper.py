# -*- coding: utf-8 -*-
"""
Spyder Editor
"""

from bs4 import BeautifulSoup
import requests
import pandas as pd

r = requests.get('https://www.kbb.com/car-reviews/')
soup = BeautifulSoup(r.text, 'html5lib')

make_list = []

for link in soup.find_all('a'):
    try:
        if (link.get('class')[0] == 'js-browseby-make'):    
            txt = ''
            for i in link.text:
                if (not(i == '\n') and not(i == '\t')):
                    txt += i
            if not(txt in make_list):
                make_list.append(txt)
    except:
        continue

print('Car Makes ready!')

dict_make_model = {}

for make in make_list:
    make = "-".join(make.split(" "))
    r = requests.get('https://www.kbb.com/'+make)
    soup = BeautifulSoup(r.text, 'html5lib')
    model_list = []
    for link in soup.find_all('h3'):
        txt = ''
        for i in link.text:
            if (not(i == '\n') and not(i == '\t')):
                txt += i
        if not(txt in model_list):
            model_list.append(txt)
    dict_make_model[make] = model_list[:-1]

print('Make Model Matched!')

quit
    
KBB_ratings = pd.DataFrame(
    columns=['Make', 'Model', 'Year', 'Rating'])
    
for i in dict_make_model:
    for j in dict_make_model[i]:
        make = i
        model = j[5+len(make)+1:]  
        this_car_link = 'https://www.kbb.com/'+ make +'/'+ model +'/'
        r = requests.get(this_car_link)
        soup = BeautifulSoup(r.text, 'html5lib')
        for sec in soup.find_all('section'):
            if sec.get('data-analytics') == 'overview':
                overview_section = sec
        this_car_years = []
        for lis in overview_section.find_all('li'):
            this_car_years.append(lis.text)
        print(make + ' ' + model + ' has ' + ' '.join(this_car_years) + ' year models' )
        for year in this_car_years:
            if len(year) == 4:
                try:
                   r = requests.get(this_car_link+'/'+year)
                   soup = BeautifulSoup(r.text, 'html5lib')  
                   texts = []
                   for link in soup.find_all('div'):
                       texts.append(link.text)
                   locate_rating = texts.index("KBB Expert Rating") + 3
                   KBB_ratings = KBB_ratings.append({'Make': make, 'Model': model, 'Year': year, 'Rating': texts[locate_rating] }, ignore_index=True)
                   print(texts[locate_rating] + 'is the KBB Expert Rating for ' + make + ' ' + model + ' ' + year)
                except ValueError:
                  print("Rating not found for "+ make + ' ' + model + ' ' + year)
                except:
                  print("Something else went wrong for "+ make + ' ' + model + ' ' + year)
            else:
                print('Stupid Scrapper!')

print('Beautiful Soup!')

print('Here is a taster')

print(KBB_ratings.head())

export_csv = KBB_ratings.to_csv (r'KBB_expert_ratings.csv', index = None, header=True)




