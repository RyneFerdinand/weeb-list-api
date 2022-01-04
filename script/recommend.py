import pandas as pd
from sklearn.neighbors import NearestNeighbors
import sys, json

neighbor = 5
user_data = sys.stdin.readlines()
rating = json.loads(user_data[0])

df = pd.read_csv('./script/rating_complete_smaller.csv')

if int(sys.argv[1]) == 1:
  userID = "REC";
  animeID = rating["animeID"]
  data = {df.columns[0]: userID, df.columns[1]: animeID, df.columns[2]: 10}
  df = df.append(data, ignore_index=True)
else:
  userID = rating["userID"]
  

df = pd.pivot_table(df, values=['rating'], index=['user_id'], columns=['anime_id'])
df = df.fillna(0)

knn = NearestNeighbors(metric='cosine', algorithm='brute')
knn.fit(df.values)
distances, indices = knn.kneighbors(df.values, n_neighbors=neighbor)

recommendedJSON = [];

def get_recommended_animes(user_index, data):
  recommended_animes = []
  anime_list = data.columns.tolist()
  
  for i in range(0, len(data.columns)):
    if df.iloc[user_index, i] == 0:
      recommended_animes.append((anime_list[i][1], data.iloc[user_index, i]))
      
  sorted_recommended_anime = sorted(recommended_animes, key=lambda x:x[1], reverse=True)
  
  for i in range(0, 10):
    recommendedJSON.append(sorted_recommended_anime[i][0]);

def recommender_animes(userID):
  df_copy = df.copy()
  user_index = df.index.tolist().index(userID)
  similar_users = indices[user_index].tolist()
  distance_users = distances[user_index].tolist()

  if user_index in similar_users:
    distance_users.pop(similar_users.index(user_index))
    similar_users.remove(user_index)
  else:
    similar_users = similar_users[:(neighbor - 1)]
    distance_users = distance_users[:(neighbor - 1)]
    
  for i in range(0, len(df.columns)):
    if df.iloc[user_index, i] == 0:
      user_similarity = [1-x for x in distance_users]
      user_similarity_copy = user_similarity.copy()
      nominator = 0

      for j in range(0, len(user_similarity)):
        if df.iloc[similar_users[j], i] == 0:
          if len(user_similarity_copy) == (neighbor - 1):
            user_similarity_copy.pop(j)
          else:
            user_similarity_copy.pop(j-(len(user_similarity)-len(user_similarity_copy)))
            
        else:
          nominator = nominator + user_similarity[j]*df.iloc[similar_users[j], i]
      
      predicted_rating = 0
      if len(user_similarity_copy) > 0:
        if sum(user_similarity_copy) > 0:
          predicted_rating = nominator/sum(user_similarity_copy)
          
      df_copy.iloc[user_index, i] = predicted_rating
      
  get_recommended_animes(user_index, df_copy)

recommender_animes(userID)

print(recommendedJSON)