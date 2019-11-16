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
    
KBB_pros = pd.DataFrame(
    columns=['Make', 'Model', 'Year', 'Pros'])
    
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
                   texts_p = []
                   for link in soup.find_all('p'):
                       texts_p.append(link.text)
                   KBB_pros = KBB_pros.append({'Make': make, 'Model': model, 'Year': year, 'Pros': texts_p[1] }, ignore_index=True)
                   print(texts_p[1] + 'are the KBB Pros for ' + make + ' ' + model + ' ' + year)
                except ValueError:
                  print("Rating not found for "+ make + ' ' + model + ' ' + year)
                except:
                  print("Something else went wrong for "+ make + ' ' + model + ' ' + year)
            else:
                print('Stupid Scrapper!')

print('Beautiful Soup!')

print('Here is a taster')

print(KBB_pros.head())

export_csv = KBB_pros.to_csv (r'KBB_pros.csv', index = None, header=True)




