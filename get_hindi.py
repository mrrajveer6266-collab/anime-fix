import requests
from bs4 import BeautifulSoup

url = input("Enter Hindi Anime Episode Page URL: ")
headers = {'User-Agent': 'Mozilla/5.0 (Android; Mobile)'}

try:
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    
    iframe = soup.find('iframe')
    if iframe and 'src' in iframe.attrs:
        print("\n✅ Found Video Link:")
        print(iframe['src'])
    else:
        print("\n❌ No iframe video link found.")
except Exception as e:
    print("Error:", e)
