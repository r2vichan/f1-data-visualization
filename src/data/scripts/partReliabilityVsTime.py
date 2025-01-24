import csv, json
from collections import defaultdict

constructorIdToName = dict()
with open('../originalDataset/constructors.csv', mode='r') as file:
    csvReader = csv.DictReader(file)
    for row in csvReader:
        row = dict(row)
        constructorIdToName[row["constructorId"]] = row["name"]

raceIdToYear = dict()
with open('../originalDataset/races.csv', mode='r') as file:
    csvReader = csv.DictReader(file)
    for row in csvReader:
        row = dict(row)
        raceIdToYear[row["raceId"]] = int(row["year"])


def createYearDict():
    d = dict()
    for i in range(1950, 2025):
        d[i] = 0
    return d

statusIdToName = {
    "5" : "Engine",
    "6" : "Transmission",
    "7" : "Transmission",
    "8" : "Transmission",
    "9" : "Hydraulics",
    "10" : "Electronics",
    "21" : "Radiator",
    "23" : "Brakes",
    "24" : "Differential",
    "36" : "Wheel",
    "37" : "Throttle"
}

finalData = defaultdict(lambda : # Key = Part
                defaultdict(lambda : # Key = Constructor
                    createYearDict() # Key = Year
                )
)

with open('../originalDataset/results.csv', mode='r') as file:
    csvReader = csv.DictReader(file)
    for row in csvReader:
        row = dict(row)
        if(row["statusId"] not in statusIdToName.keys()):
            continue

        partKey = statusIdToName[row["statusId"]]
        constructorKey = constructorIdToName[row["constructorId"]]
        yearKey = raceIdToYear[row["raceId"]]
        finalData[partKey][constructorKey][yearKey] += 1

        finalData[partKey]["Total"][yearKey] += 1

for part, constructorYearMap in finalData.items():
    for constructor, yearMap in constructorYearMap.items():
        yearList = list()
        for year, failures in yearMap.items():
            yearList.append({"year" : year, "failures" : failures})
        finalData[part][constructor] = yearList

with open("../derivedDataset/partReliabilityVsTime.json", "w") as outFile:
    json.dump(finalData, outFile, indent=4)