import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("compressed_data.csv")

df.head()

df.columns

# Check for missing values
print(df.isnull().sum())

df.info()

# Handle missing values
df['last review'] = pd.to_datetime(df['last review'], errors = 'coerce')

df.info()

df.fillna({'reviews per month' : 0, 'last review' : df['last review'].min()}, inplace = True)

df.dropna(subset = ['NAME', 'host name'], inplace = True)

print(df.isnull().sum())

df = df.drop(columns = ["license", "house_rules"], errors = 'ignore')

df.head()

df['price'] = df['price'].replace('[\$,]', '', regex = True).astype(float)
df['service fee'] = df['service fee'].replace('[\$,]', '', regex = True).astype(float)

df.head()

# Remove duplicates
df.drop_duplicates(inplace = True)

df.info()

# Descriptive statistics
df.describe()

# Visualize the distribution of listing prices

# 1. What is the distribution of listing prices?
plt.figure(figsize = (10,6))
sns.histplot(df['price'], bins = 50, kde = True, color = 'red')
plt.title("Distribution of listing price")
plt.xlabel("Price $")
plt.ylabel("Frequency")
plt.show()

'''The histogram shows a fairly even distribution of 
listing prices across different price ranges, indicating no 
particular concentration of listings in any specific price range.
The KDE line helps visualize ths even spread more clearly, 
confirming that the dataset contains listings with a wide variety of prices.''' 

# 2. How are the different room types distributed?
df["room type"]

plt.figure(figsize = (8,5))
sns.countplot(x = "room type", data = df, color = "hotpink")
plt.title("Room type distribution")
plt.xlabel("Room type")
plt.ylabel("Count")
plt.show() 

# 3. How are the listings distributed across different neighborhoods?
plt.figure(figsize = (12,8))
sns.countplot(y = 'neighbourhood group', data = df, color = "lightgreen", order = df['neighbourhood group'].value_counts().index)
plt.title('Number of listings by Neighborhood Group')
plt.xlabel('Count')
plt.ylabel('Neighborhood Group')
plt.show()

# 4. What is the relationship between price and room type?
plt.figure(figsize = (10,6))
sns.boxplot(x = 'room type', y = 'price', hue = 'room type', data = df, palette = 'Set1')
plt.title('Price vs. Room type')
plt.xlabel('Room type')
plt.ylabel('Price ($)')
plt.legend(title = 'Room Type')
plt.show()

# 5. How does the number of reviews change over with timw?
df['last review'] = pd.to_datetime(df['last review'])
reviews_over_time = df.groupby(df['last review'].dt.to_period('M')).size()

plt.figure(figsize = (12,6))
reviews_over_time.plot(kind = 'line', color = 'red')
plt.title('Number of Reviews Over Time')
plt.xlabel('Date')
plt.ylabel('Number of reviews')
plt.show()