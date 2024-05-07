import http.client

conn = http.client.HTTPSConnection("grammarbot.p.rapidapi.com")

payload = "text=Susan%20go%20to%20the%20store%20everyday&language=en-US"

headers = {
    'content-type': "application/x-www-form-urlencoded",
    'X-RapidAPI-Key': "424b4daea0msh83f1bfed246f17fp1a90e8jsn452aa575ad69",
    'X-RapidAPI-Host': "grammarbot.p.rapidapi.com"
}

conn.request("POST", "/check", payload, headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))