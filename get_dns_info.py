import socket

def get_dns_info(host):
    print(f"Resolving {host}...")
    try:
        name, aliases, addresses = socket.gethostbyaddr(socket.gethostbyname(host))
        print("Name:", name)
        print("Aliases:", aliases)
        print("Addresses:", addresses)
    except Exception as e:
        print("Error gethostbyaddr:", e)
        
    try:
        # Get addrinfo
        info = socket.getaddrinfo(host, None)
        for item in info:
            print("Addrinfo:", item)
    except Exception as e:
        print("Error getaddrinfo:", e)

get_dns_info("db.cotcprnripdhrtvfzaxk.supabase.co")
