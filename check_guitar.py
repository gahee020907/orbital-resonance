
import urllib.request

urls = [
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-acoustic/C4.wav",
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/guitar-nylon/C4.wav",
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/xylophone/C4.wav"
]

for url in urls:
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"{url}: {response.status}")
    except Exception as e:
        print(f"{url}: Error {e}")
