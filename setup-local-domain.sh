#!/bin/bash
echo "Setting up novafans.local domain..."
sudo sh -c 'echo "127.0.0.1 novafans.local" >> /etc/hosts'
echo "✅ Domain added! Now you can access:"
echo "   http://novafans.local:3000"
echo ""
echo "To remove later, edit /etc/hosts and remove the novafans.local line"
