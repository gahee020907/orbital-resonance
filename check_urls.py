
import urllib.request

urls = [
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/cello/C4.wav",
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/violin/C4.wav",
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/harp/C4.wav",
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/flute/C4.wav",
    "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/koto/C4.wav",
    "https://tonejs.github.io/audio/salamander/C4.mp3"
]

for url in urls:
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"{url}: {response.status}")
    except Exception as e:
        print(f"{url}: Error {e}")
