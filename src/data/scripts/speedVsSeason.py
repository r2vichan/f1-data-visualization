import pandas as pd
import json
import numpy as np

# Load datasets (update file paths as needed)
races = pd.read_csv("../originalDataset/races.csv")  # Contains raceId, date, and name
results = pd.read_csv("../originalDataset/results.csv")  # Contains raceId, driverId, constructorId, fastestLapSpeed
drivers = pd.read_csv("../originalDataset/drivers.csv")  # Contains driverId
constructors = pd.read_csv("../originalDataset/constructors.csv")  # Contains constructorId

# Merge relevant data
# Join races with results
data = pd.merge(results, races, on="raceId")

# Add constructor (team) information
data = pd.merge(data, constructors, on="constructorId")

# Add driver information
data = pd.merge(data, drivers, on="driverId")

# Select relevant columns for analysis
data = data[
    ["date", "name_x", "name_y", "forename", "surname", "positionOrder", "fastestLapSpeed"]
]

# Rename columns for clarity
data.columns = [
    "raceDate",
    "race",
    "team",
    "driver_forename",
    "driver_surname",
    "positionOrder",
    "fastestLapSpeed",
]

data["fastestLapSpeed"] = data["fastestLapSpeed"].replace("\\N", np.nan)

# Filter out rows with missing fastestLapSpeed
data = data.dropna(subset=["fastestLapSpeed"])

# Convert fastestLapSpeed to float
data["fastestLapSpeed"] = data["fastestLapSpeed"].astype(float)

# Ensure raceDate is in proper datetime format
data["raceDate"] = pd.to_datetime(data["raceDate"])

# Sort by raceDate
data = data.sort_values(by=["team", "raceDate"])

# Retain only the fastest driver per team per race
fastest_data = data.groupby(["team", "raceDate", "race"]).first().reset_index()

# Format data for JSON export
plot_data = {}
for _, row in fastest_data.iterrows():
    team = row["team"]
    if team not in plot_data:
        plot_data[team] = []
    plot_data[team].append({
        "raceDate": row["raceDate"].strftime("%Y-%m-%d"),  # Convert to string format
        "race": row["race"],
        "driver": f"{row['driver_forename']} {row['driver_surname']}",
        "positionOrder": int(row["positionOrder"]),
        "fastestLapSpeed": float(row["fastestLapSpeed"]),
    })

# Convert to final JSON format
d3_plot_data = {
    "teams": list(plot_data.keys()),
    "data": plot_data,
}

# Save to a JSON file
output_path = "../derivedDataset/speedVsTime.json"
with open(output_path, "w") as f:
    json.dump(d3_plot_data, f, indent=4)

print(f"JSON data saved to '{output_path}'")
