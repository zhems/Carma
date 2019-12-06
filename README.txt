Instructions:
# Car.m.a - A Car Matching Algorithm
-----------------------------------
Produced for CSE6242 Fall 2019 Project
git repository: https://github.com/zhems/Carma


## Description
--------------
Car.m.a is a dynamic and responsive web application that displays car listings in the order in which they are ranked. Based off a MEAN stack, the application consists of two key components, a mongodb database and a node.js web server. While the ranking of the listings is completed separately before being uploaded to the database, filtering and the final calculation of ranking components is done client-side. A toy dataset of 100 listings in Atlanta, GA (Zip: 30318) is provided as a demonstration for the application. 

The following installation and execution information is only meant for used on a demonstration on a local system. Deploying to cloud infrastructure follows a similar process, but the required commands are dependent on the service provider and are thus not covered in this instructions.

All code for the visualization has been tested and ran on Ubuntu 18.04.03 LTS and written with Vim 8.0


## Installation
-------------
Before the visualization can be installed, the following list of software is required

	mongoDB v3.6.3
	node.js v8.10.0
	npm v3.5.2

Install the application by copying

	app.js
	package.json
	static/

from the demo folder in the package into any folder on the local drive. Proceed to install the dependencies by running

	npm install

in the same folder. Next, ensure that the mongoDB service by running

	sudo service mongodb service
	
Import the necessary data by running

	mongodb --db=carma --collection=zips --type=csv --headerline --file="sample/cleaned_zipcode.csv"
	mongodb --db=carma --collection=prod --type=csv --headerline --file="sample/ranked_listings.csv"

Toy datasets can be found in demo/sample.


## Execution
---------------
Run the visualization by running 

	node app.js

in the same folder as app.js. Navigate to 

	localhost:8000

in a browser to access the demo. 


## Data Collection
------------------


### Software Requirements for Data Collection
--------------------------------------------
This section provides information on how to reproduce or gather more information outside of the toy dataset provided. A large combination of web scrapers and data sources were used and the required software includes multiple python dependencies. For ease of use, we recommend the Anaconda Distribution. 
 
	Anaconda3 2019.10

Additionally packages are also required to be installed for use with the Anaconda environment and are listed here.

	scrapy 1.8.0
	fuzzywuzzy 0.17

Some additional data files are required

	FLAT_RCL.txt from http://www-odi.nhtsa.dot.gov/downloads/folders/Recalls/FLAT_RCL.zip
	us-zip-code-latitude-and-longitude.csv from https://public.opendatasoft.com/explore/dataset/us-zip-code-latitude-and-longitude/table/
	2019.csv from https://github.com/AbhiOnlyOne/us-car-models-data renamed to us_car_models.csv 
	
All other required files for collecting the data can be found in the data folder of this package

### Listings Data
-----------------
There are two sources of listings used for this project, Craigslist and Marketcheck. To obtain listings data from Craigslist, first install the required scraper environment. Place us_car_models.csv in the data/craigslist folder of this package. All other required files for this section can be found in that same folder.
Create a Scrapy Project
Move the craigslist_scraper_by_domain.py file to the /spiders folder in your Scrapy Project folder

To run the scrapper on a single city, navigate to the scrapy project folder and run

	scrapy crawl craigslistScraper -o {output_file} -a city={craigslist_domain}

{output_file} indicates the desired output file name and path
{craigslist_domain} indicates the desired Craigslist domain. E.g. “auburn” for https://auburn.craigslist.org/. 

To run the scrapper on all existing Craigslist's domain, a shell script has been provided. 
Install the script by moving scrape_all_cities.sh and craigslist_domain.csv into the scrapy project folder. Run the script with

	bash scrape_all_cities.sh

To scrape data from Marketcheck API, first register for an account at https://www.marketcheck.com/users/sign_up and retrieve an API key. Place us_car_models.csv in the data/marketcheck folder of this package. All other required files for this section can be found in that same folder.

Run the script with

	python3 marketcheck.py {key}

{key} indicates the key received after signing up for the API.

Clean the data by running

	python3 marketcheck_clean.py

from the same folder as latlong.py.

Both listings can be combined by placing the output files of the scripts

	{output_file} from running the craigslist scraper
	{cleaned_listings.json} from running the marketcheck scripts

into data/join_listings folder of this package, then running all cells in the join_listings.ipynb on jupyter notebook.

Final output files

	allListings.csv


### NHTSA Recalls Data
-------------------------------
Place FLAT_RCL.txt from the downloaded FLAT_RCL.zip in the data/nhtsa folder in the package. Place us_car_models.csv in the data/nhtsa folder of this package. All other required files for this section can be found in that same folder.

Run all cells in NHTSA_cleaner.ipynb using a jupyter notebook to clean the data.

Final output files

	NHTSA_recalls.csv


### JD Powers Data
------------------
Place us_car_models.csv in the data/jdpower folder of this package. All other required files for this section can be found in that same folder.

To scrape data from JD Powers, run all cells in JDpower_scraper.ipynb.

Place results.csv produced by the scraper into the jdpower folder of this package.
Run all cells in JDpower_cleaner.ipynb to clean the data.

Final output files

	jdpower_cleaned_final.csv


### KBB Data
------------------
Place us_car_models.csv in the data/kbb folder of this package. All other required files for this section can be found in that same folder.

All scrappers can be executed by running

	Python3 mpg_scrapper.py
	Python3 pros_scrapper.py
	Python3 ratings_scrapper.py

Obtain the micro-genres information from the KBB data by placing the output file

	KBB_pros.csv

into the kbb folder of this package. Run all cells of generate_car_cats.ipynb on a jupyter notebook.

Final output files

	KBB_consumer_ratings_standard.csv
	KBB_mpg_standard.csv
	KBB_ratings_standard.csv
	car_micro_genres.csv


### Merging all listings
---------------------
To merge scraped data and apply ranking algorithm, place the following files obtained from the previous scrappers and downloads into the rank_listings folder in the package.

	allListings.csv
	car_micro_genres.csv
	jdpower_cleaned_final.csv
	KBB_consumer_ratings_standard.csv
	KBB_mpg_standard.csv
	KBB_ratings_standard.csv
	NHTSA_recalls.csv
	us_car_models.csv
	us-zip-code-latitude-and-longitude.csv

Run all cells in rank_listings.ipynb using a jupyter notebook. The following 2 files can then be used in the application.

	ranked_listings.csv
	cleaned_zipcode.csv
