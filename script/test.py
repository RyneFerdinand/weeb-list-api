import pandas as pd
from sklearn.neighbors import NearestNeighbors
import sys, json
import numpy as np

neighbor = 10;

user_data = sys.stdin.readlines()
rating = json.loads(user_data[0])

user_data = input();
rating = json.loads(user_data)
userID = rating["userID"]

df = pd.read_csv('./script/rating_complete_smaller.csv', nrows=250000)

df = pd.pivot_table(df, values=['rating'], index=['user_id'], columns=['anime_id'])
df = df.fillna(0)

recommendationJSON = [];

knn = NearestNeighbors(metric='cosine', algorithm='brute')
knn.fit(df.values)
distances, indices = knn.kneighbors(df.values, n_neighbors=10)


def get_recommended_movies(user_index, data):
  recommended_movies = []
  anime_list = data.columns.tolist()
  for i in range(0, len(data.columns)):
    if df.iloc[user_index, i] == 0:
      recommended_movies.append((anime_list[i][1], data.iloc[user_index, i]))
  sorted_rm = sorted(recommended_movies, key=lambda x:x[1], reverse=True)
  for i in range(0, 5):
    print('{}: {} - rating: {}'.format(i + 1, sorted_rm[i][0], sorted_rm[i][1]))

def recommender_movies(userID):
  df1 = df.copy()
  user_index = df.index.tolist().index(userID)
  similar_users = indices[user_index].tolist()
  distance_users = distances[user_index].tolist()
  if user_index in similar_users:
    distance_users.pop(similar_users.index(user_index))
    similar_users.remove(user_index)
  else:
    similar_users = similar_users[:4]
    distance_users = distance_users[:4]
  for i in range(0, len(df.columns)):
    if df.iloc[user_index, i] == 0:
      user_similarity = [1-x for x in distance_users]
      user_similarity_copy = user_similarity.copy()
      nominator = 0
      for j in range(0, len(user_similarity)):
        if df.iloc[similar_users[j], i] == 0:
          if len(user_similarity_copy) == 4:
            user_similarity_copy.pop(j)
          else:
            user_similarity_copy.pop(j-(len(user_similarity)-len(user_similarity_copy)))
        else:
          nominator = nominator + user_similarity[j]*df.iloc[similar_users[j], i]
      predicted_r = 0
      if len(user_similarity_copy) > 0:
        if sum(user_similarity_copy) > 0:
          predicted_r = nominator/sum(user_similarity_copy)
      df1.iloc[user_index, i] = predicted_r

  get_recommended_movies(user_index, df1)

recommender_movies(4)