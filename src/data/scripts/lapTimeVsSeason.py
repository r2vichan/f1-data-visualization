# import pandas as pd
# import json
# import numpy as np

# # Load datasets (update file paths as needed)
# races = pd.read_csv("../originalDataset/races.csv")  # Contains raceId, date, and name
# results = pd.read_csv("../originalDataset/results.csv")  # Contains raceId, driverId, constructorId, fastestLapSpeed
# drivers = pd.read_csv("../originalDataset/drivers.csv")  # Contains driverId
# constructors = pd.read_csv("../originalDataset/constructors.csv")  # Contains constructorId
# lap_times = pd.read_csv("../originalDataset/lap_times.csv")  # Contains raceId, driverId, lapTime (in milliseconds)

# # Merge the results with races to get race name and raceDate
# data = pd.merge(results, races, on="raceId")

# # Add team (constructor) information
# data = pd.merge(data, constructors, on="constructorId")

# # Add driver information
# data = pd.merge(data, drivers, on="driverId")

# # Calculate average lap time for each driver in each race (lap_times in milliseconds)
# lap_avg_data = lap_times.groupby(["raceId", "driverId"])["milliseconds"].mean().reset_index()

# # Merge the lap average data into the main dataframe
# data = pd.merge(data, lap_avg_data, on=["raceId", "driverId"])

# # Convert lap times from milliseconds to seconds
# data["lapTime"] = data["milliseconds_y"] / 1000

# # Select relevant columns for analysis
# data = data[["date", "name_x", "forename", "surname", "positionOrder", "lapTime", "name_y"]]

# # Rename columns for clarity
# data.columns = ["raceDate", "race", "driver_forename", "driver_surname", "positionOrder", "lapTime", "team"]

# # Clean up raceDate and sort by team, raceDate, and year
# data["raceDate"] = pd.to_datetime(data["raceDate"])
# data["year"] = data["raceDate"].dt.year  # Extract the year from the raceDate
# data = data.sort_values(by=["team", "year", "raceDate"])

# # Step 1: Find the fastest driver in each team for each race in each year
# # For each race, team, and year, find the driver with the fastest lap time
# fastest_driver = data.loc[data.groupby(["year", "race", "team"])["lapTime"].idxmin()]

# # Step 2: Prepare the final structure
# plot_data = {}
# for _, row in fastest_driver.iterrows():
#     team = row["team"]
#     if team not in plot_data:
#         plot_data[team] = []
    
#     plot_data[team].append({
#         "raceDate": row["raceDate"].strftime("%Y-%m-%d"),  # Convert to string format
#         "race": row["race"],
#         "driver": f"{row['driver_forename']} {row['driver_surname']}",
#         "positionOrder": int(row["positionOrder"]),
#         "lapTime": round(row["lapTime"], 3),  # Convert lap time to seconds
#         "year": row["year"]
#     })

# # Convert to final JSON format
# d3_plot_data = {
#     "teams": list(plot_data.keys()),
#     "data": plot_data,
# }

# # Save to a JSON file
# output_path = "../derivedDataset/lapTimesVsSeason.json"
# with open(output_path, "w") as f:
#     json.dump(d3_plot_data, f, indent=4)

# print(f"JSON data saved to '{output_path}'")


import pandas as pd
import json
import numpy as np

# Load datasets (update file paths as needed)
races = pd.read_csv("../originalDataset/races.csv")  # Contains raceId, date, and name
results = pd.read_csv("../originalDataset/results.csv")  # Contains raceId, driverId, constructorId, fastestLapSpeed
drivers = pd.read_csv("../originalDataset/drivers.csv")  # Contains driverId
constructors = pd.read_csv("../originalDataset/constructors.csv")  # Contains constructorId
lap_times = pd.read_csv("../originalDataset/lap_times.csv")  # Contains raceId, driverId, lapTime (in milliseconds)

# Merge the results with races to get race name and raceDate
data = pd.merge(results, races, on="raceId")

# Add team (constructor) information
data = pd.merge(data, constructors, on="constructorId")

# Add driver information
data = pd.merge(data, drivers, on="driverId")

# Calculate average lap time for each driver in each race (lap_times in milliseconds)
lap_avg_data = lap_times.groupby(["raceId", "driverId"])["milliseconds"].mean().reset_index()

# Merge the lap average data into the main dataframe
data = pd.merge(data, lap_avg_data, on=["raceId", "driverId"])

# Convert lap times from milliseconds to seconds
data["lapTime"] = data["milliseconds_y"] / 1000

# Select relevant columns for analysis
data = data[["date", "name_x", "forename", "surname", "positionOrder", "lapTime", "name_y"]]

# Rename columns for clarity
data.columns = ["raceDate", "race", "driver_forename", "driver_surname", "positionOrder", "lapTime", "team"]

# Clean up raceDate and sort by team, raceDate, and year
data["raceDate"] = pd.to_datetime(data["raceDate"])
data["year"] = data["raceDate"].dt.year  # Extract the year from the raceDate
data = data.sort_values(by=["team", "year", "raceDate"])

# Step 1: Find the fastest driver in each team for each race in each year
# For each race, team, and year, find the driver with the fastest lap time
fastest_driver = data.loc[data.groupby(["year", "race", "team"])["lapTime"].idxmin()]

# Step 2: Identify and remove outliers based on IQR (Interquartile Range)
def remove_outliers(group):
    # Calculate the IQR for the lapTime column for the current group (race, year, and all teams)
    Q1 = group["lapTime"].quantile(0.25)
    Q3 = group["lapTime"].quantile(0.75)
    IQR = Q3 - Q1
    
    # Define the acceptable range: values outside this range are considered outliers
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    # Filter out rows where lapTime is outside the acceptable range
    filtered_group = group[(group["lapTime"] >= lower_bound) & (group["lapTime"] <= upper_bound)]
    
    return filtered_group

# Apply outlier removal for each race and year group
filtered_fastest_driver = fastest_driver.groupby(["year", "race"]).apply(remove_outliers).reset_index(drop=True)

# Step 3: Prepare the final structure
plot_data = {}
for _, row in filtered_fastest_driver.iterrows():
    team = row["team"]
    if team not in plot_data:
        plot_data[team] = []
    
    plot_data[team].append({
        "raceDate": row["raceDate"].strftime("%Y-%m-%d"),  # Convert to string format
        "race": row["race"],
        "driver": f"{row['driver_forename']} {row['driver_surname']}",
        "positionOrder": int(row["positionOrder"]),
        "lapTime": round(row["lapTime"], 3),  # Convert lap time to seconds
        "year": row["year"]
    })

# Convert to final JSON format
d3_plot_data = {
    "teams": list(plot_data.keys()),
    "data": plot_data,
}

# Save to a JSON file
output_path = "../derivedDataset/lapTimesVsSeason.json"
with open(output_path, "w") as f:
    json.dump(d3_plot_data, f, indent=4)

print(f"JSON data saved to '{output_path}'")
