import pandas as pd
import sys, json

# 1: add
# 2: delete

user_data = sys.stdin.readlines()
rating = json.loads(user_data[0])
print(rating)
df = pd.read_csv('./script/rating_complete_smaller.csv')

if int(sys.argv[1]) == 1:
    userID = rating["userID"]
    animeID = int(rating["animeID"])
    rate = float(rating["rating"])
    data = {df.columns[0]: userID, df.columns[1]: animeID, df.columns[2]: rate}
    df = df.append(data, ignore_index=True)

    df.to_csv('./script/rating_complete_smaller.csv', index=False, sep=',')

    print("Successfully Added...")
elif int(sys.argv[1]) == 2:
    userID = rating["userID"]
    animeID = int(rating["animeID"])

    df.drop(df[((df["user_id"] == userID) & (df["anime_id"] == int(animeID)))].index, inplace=True)
    df.to_csv('./script/rating_complete_smaller.csv', index=False, sep=',')

    print("Successfully Removed...")
elif int(sys.argv[1]) == 3:
    userID = rating["userID"]
    animeID = int(rating["animeID"])
    rate = float(rating["rating"])
    
    df.drop(df[((df["user_id"] == userID) & (df["anime_id"] == int(animeID)))].index, inplace=True)
    data = {df.columns[0]: userID, df.columns[1]: animeID, df.columns[2]: rate}
    df = df.append(data, ignore_index=True)

    df.to_csv('./script/rating_complete_smaller.csv', index=False, sep=',')

    print("Successfully Updated...")