import pandas as pd
from sklearn.neighbors import NearestNeighbors
import pickle

neighbor = 51;

df = pd.read_csv('./script/rating_complete_smaller.csv')

df = pd.pivot_table(df, values=['rating'], index=['user_id'], columns=['anime_id'])
df = df.fillna(0)

knn = NearestNeighbors(metric='cosine', algorithm='brute')
knn.fit(df.values)

knnPickle = open('./script/recommendation_model', 'wb') 
pickle.dump(knn, knnPickle)

print("Model Updated !")