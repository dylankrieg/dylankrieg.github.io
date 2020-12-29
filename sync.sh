#!/bin/bash
source ~/.bash_profile

pyenv activate mikesachs.com

BASEDIR=$(pwd)

#
# Create the web version of the PDF resume.
#
cd "$BASEDIR"/python/
python to_xetex.py -w
cd "$BASEDIR"/tex/
/Library/TeX/texbin/xelatex -synctex=1 -interaction=nonstopmode -output-driver="/Library/TeX/texbin/xdvipdfmx -q -E" "$BASEDIR"/tex/pdf_web.xetex
mv "$BASEDIR"/tex/pdf_web.pdf "$BASEDIR"/pdf/MichaelSachs.pdf

#
# Create the mini web version of the PDF resume.
#
cd "$BASEDIR"/python/
python to_xetex.py -w -m
cd "$BASEDIR"/tex/
/Library/TeX/texbin/xelatex -synctex=1 -interaction=nonstopmode -output-driver="/Library/TeX/texbin/xdvipdfmx -q -E" "$BASEDIR"/tex/pdf_web.xetex
mv "$BASEDIR"/tex/pdf_web.pdf "$BASEDIR"/pdf/MichaelSachsMini.pdf

#
# Create the print version of the PDF resume.
#
cd "$BASEDIR"/python/
python to_xetex.py -p
cd "$BASEDIR"/tex/
/Library/TeX/texbin/xelatex -synctex=1 -interaction=nonstopmode -output-driver="/Library/TeX/texbin/xdvipdfmx -q -E" "$BASEDIR"/tex/pdf_print.xetex
mv "$BASEDIR"/tex/pdf_print.pdf "$BASEDIR"/pdf/MichaelSachsPrint.pdf

#
# Create the mini print version of the PDF resume.
#
cd "$BASEDIR"/python/
python to_xetex.py -p -m
cd "$BASEDIR"/tex/
/Library/TeX/texbin/xelatex -synctex=1 -interaction=nonstopmode -output-driver="/Library/TeX/texbin/xdvipdfmx -q -E" "$BASEDIR"/tex/pdf_print.xetex
mv "$BASEDIR"/tex/pdf_print.pdf "$BASEDIR"/pdf/MichaelSachsPrintMini.pdf

cd "$BASEDIR"

#
# Cleanup
#
rm tex/*.aux
rm tex/*.log
rm tex/*.out
rm tex/*.synctex.gz
rm tex/*.xetex
rm tex/*.log

#
# Synch with the server.
#

rsync -avhL --delete --exclude-from 'exclude-list.txt' "$BASEDIR"/ mksachs@habersham.dreamhost.com:mikesachs.com

pyenv deactivate