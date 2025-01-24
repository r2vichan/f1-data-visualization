import pandas as pd
import csv
df6=pd.DataFrame(columns=['circuit_name','accident','collision','spun_off','fatal_accident','total'])
dict1={}
# df1 = pd.read_csv('../originalDataset/results.csv')

# df2 = pd.read_csv('../originalDataset/races.csv')

# df3 = pd.read_csv('../originalDataset/circuits.csv')

# merged_df = pd.merge(df1, df2[['raceId','circuitId']], on='raceId', how='left')
# merged_df2 = pd.merge(merged_df, df3[['circuitId','name','location','country']], on='circuitId', how='left')

# merged_df2.to_csv('../derivedDataset/merged.csv', index=False)

# run through this new csv
# if statusId in [3,4,20,104]:
#     then append +1 to the circuit name and accident column - 
#     {"circuit","accidents","collisions","spin offs","fatal accidents","total"}
#     eg -> {"Adelaide Street Circuit","5","10","10","1","26"}

df5 = pd.read_csv('../derivedDataset/merged.csv')

for index, row in df5.iterrows():
    a = row['name']
    b = row['statusId']
    c=row['location']
    d=row['country']
    # Initialize row if not present
    if a not in df6['circuit_name'].values:
        new_row=pd.DataFrame({'circuit_name': [a], 'accident': [0], 'collision': [0], 'spun_off': [0], 'fatal_accident': [0], 'total': [0], 'location':[c], 'country':[d]})
        df6 = pd.concat([df6, new_row], ignore_index=True)
    # Now get the index of the row we just added or already existed
    row_index = df6[df6['circuit_name'] == a].index[0]
    
    # Match and update
    match b:
        case 3:
            df6.at[row_index, 'accident'] += 1
            df6.at[row_index, 'total'] += 1
        case 4:
            df6.at[row_index, 'collision'] += 1
            df6.at[row_index, 'total'] += 1
        case 20:
            df6.at[row_index, 'spun_off'] += 1
            df6.at[row_index, 'total'] += 1
        case 104:
            df6.at[row_index, 'fatal_accident'] += 1
            df6.at[row_index, 'total'] += 1


print(df6)

df6.to_csv('../derivedDataset/finalCircuitData.csv')
# field_names=['Circuit name','Total']       

# with open('../derivedDataset/finalCircuitData.csv','w', newline='') as csv_file:
#     writer = csv.writer(csv_file)
#     writer.writerow(['circuit_name','total'])
#     for key, value in dict1.items():
#        writer.writerow([key, value])
