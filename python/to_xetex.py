import sys
import argparse
import re

import bs4
from bs4 import BeautifulSoup

sys.path.append('./')


def latex_escape(text, abbrev=False):
    if len(text) != 0:
        if abbrev:
            tmp_text = '.~'.join(text.split('. '))
            if tmp_text[-1] == '~':
                text = tmp_text[0:-2]
            else:
                text = tmp_text
        return '\\%'.join('\\&'.join('\\#'.join('\\_'.join(text.split('_')).split('#')).split('&')).split('%'))
    else:
        return ''


def author_line(text):
    if len(text.split('*M. K. Sachs')) == 1:
        return latex_escape(' \\bf{M. K. Sachs}'.join(text.split('M. K. Sachs')), abbrev=True)
    else:
        return latex_escape(' \\bf{*M. K. Sachs}'.join(text.split('*M. K. Sachs')), abbrev=True)


def create_bib_item(bib_item_node):
    content_str = ''
    for child in bib_item_node.children:
        if type(child) is bs4.element.Tag:
            if child.name == 'span':
                if child['class'][0] == 'Title':
                    try:
                        content_str += '\\item \\it{\\href{%s}{%s}}'%(latex_escape(child.contents[0]['href']), latex_escape(child.get_text(strip=True)))
                    except TypeError:
                        content_str += '\\item \\it{%s}'%(latex_escape(child.get_text(strip=True)))
                elif child['class'][0] == 'Author':
                    content_str += '%s'%(author_line(child.get_text(strip=True)))
                elif child['class'][0] == 'Date':
                    content_str += '(%s)'%(latex_escape(child.get_text(strip=True), abbrev=True))
                else:
                    content_str += '%s'%(latex_escape(child.get_text(strip=True), abbrev=True))
            elif child.name == 'br':
                content_str += '\\\\ \r'
        elif type(child) is bs4.element.NavigableString:
            try:
                char = child.encode('ascii', 'xmlcharrefreplace').strip().split()[0]
            except IndexError:
                char = None
            if char == '&#160;':
                content_str += ' '
    if content_str[-4:-1].strip() == '\\\\':
        return content_str[0:-4]
    else:
        return content_str


def main(argv=None):
    if argv is None:
        argv = sys.argv
    
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        '-w', '--web',
        help='Create the web version of the pdf resume. If no args are supplied this is the default action.',
        action='store_true'
    )
    group.add_argument('-p', '--print', dest='print_ver', help='Create the print version of the pdf resume.',
                    action='store_true')
    parser.add_argument('-m', '--min', dest='min', help='Create a mini version of the resume.',
                       action='store_true')
    args = parser.parse_args()

    html_f = open('../index.html')
    
    skip_sections = ['examples']

    if args.print_ver:
        xetex_template_f = open('../tex/templates/template_print.xetex')
        skip_sections.append('conferences')
    else:
        xetex_template_f = open('../tex/templates/template_web.xetex')

    if args.min:
        skip_sections.append('publications')
        skip_sections.append('awards_and_recognition')
        skip_sections.append('teaching_experience')
        skip_sections.append('press')
        skip_sections.append('conferences')

    skip_sections = list(set(skip_sections))

    resume_text_f = open('../resume.txt', 'w')
    
    xetex_template = xetex_template_f.read().split('%%%%%%%%%%%%%%%%%%%%%%%%% Content Here %%%%%%%%%%%%%%%%%%%%%%%%%%%%')

    soup = BeautifulSoup(html_f.read(), 'html.parser')

    content = soup('div', {'class':'content'})
    xetex_output = [xetex_template[0]]

    for c_tag in content:
        section_title = c_tag.find('div', {'class':'section_title'}).get_text(strip=True)
        section_id = c_tag['id']
        
        if section_id not in skip_sections:
            print(section_id)
            resume_text_f.write('\r' + section_title + '\r')
            
            if section_id != 'summary':
                xetex_output.append('\\section{%s}'%section_title)
            
            content_items = c_tag.find_all('div', {'class':'content_item'})
            
            if section_id == 'publications':
                content_items = c_tag.find_all('p', {'class':'content_item'})
                xetex_output.append('\\begin{bibsection}')
            elif section_id == 'conferences':
                pass
            elif section_id == 'awards_and_recognition':
                xetex_output.append('\\begin{loneinnerlist}')
            elif section_id == 'summary':
                content_items = c_tag.find_all('p', {'class':'content_item'})
                
            for ci_tag in content_items:
                
                if section_id == 'publications':
                    xetex_output.append(create_bib_item(ci_tag))
                elif section_id == 'conferences':
                    title_tag = ci_tag.find('h1')
                    title_href_tag = title_tag('a')
                    try:
                        title_href = title_href_tag[0]['href']
                    except IndexError:
                        title_href = ''
                    xetex_output.append('\\subsection{%s}{%s}' % (latex_escape(title_tag.get_text(strip=True)), title_href))
                    
                    xetex_output.append('\\begin{bibsection}')
                    bib_items = ci_tag.find_all('p')
                    for bib_item in bib_items:
                        xetex_output.append(create_bib_item(bib_item))
                    xetex_output.append('\\end{bibsection}')
                    xetex_output.append('\\vspace{\\baselineskip}')
                    
                elif section_id == 'awards_and_recognition':
                    xetex_output.append('\\item %s' % (latex_escape(ci_tag.get_text(strip=True))))
                elif section_id == 'press':
                    title_tag = ci_tag.find('h1')
                    link_tags = ci_tag.find_all('a')
                    
                    xetex_output.append('\\subsection{%s}{}' % (latex_escape(title_tag.get_text(strip=True))))
                    xetex_output.append('\\begin{outerlist}')
                    for link_tag in link_tags:
                        xetex_output.append('\\item[] %s : \\\\ \\url{%s}' % (latex_escape(link_tag.get_text(strip=True)), latex_escape(link_tag['href'])))
                    xetex_output.append('\\end{outerlist}')
                    xetex_output.append('\\vspace{\\baselineskip}')
                elif section_id == 'summary':
                    resume_text_f.write(re.sub(r'\s+', ' ', latex_escape(ci_tag.get_text(strip=False).strip())) + '\r')
                    xetex_output.append('%s' % (latex_escape(ci_tag.get_text(strip=False).strip())))
                    
                else:
                    for child in ci_tag.children:
                        if type(child) is bs4.element.Tag:
                            if child.name == 'h1':
                                subsection_a_tag = child.find('a')
                                if subsection_a_tag is not None:
                                    subsection_href = subsection_a_tag['href']
                                else:
                                    subsection_href = ''
                                subsection_title = child.get_text(strip=True)
                                resume_text_f.write('\r' + re.sub(r'\s+', ' ', subsection_title) + '\r')
                                xetex_output.append('\\subsection{%s}{%s}' % (latex_escape(subsection_title), subsection_href))
                                xetex_output.append('\\begin{outerlist}')
                            elif child.name == 'p':
                                outerlist_item = child.contents[0].strip()
                                resume_text_f.write(re.sub(r'\s+', ' ', latex_escape(outerlist_item)) + '\r')
                                xetex_output.append('\\item[] %s' % (latex_escape(outerlist_item)))
                                outerlist_hfil_tag = child.find('span')
                                if outerlist_hfil_tag is not None:
                                    outerlist_hfil = outerlist_hfil_tag.get_text(strip=True)
                                    resume_text_f.write(re.sub(r'\s+', ' ', latex_escape(outerlist_hfil)) + '\r')
                                    xetex_output.append(' \\hfill {%s}' % (latex_escape(outerlist_hfil)))
                            elif child.name == 'ul':
                                xetex_output.append('\\begin{innerlist}')
                                innerlist_item_tags = child.find_all('li', recursive=False)
                                for innerlist_item_tag in innerlist_item_tags:
                                    innerlist_item_str = ''
                                    for c in innerlist_item_tag.children:
                                        if type(c) is bs4.element.Tag:
                                            innerlist_item_str += '\\href{%s}{%s}'%(latex_escape(c['href']), latex_escape(c.get_text(strip=True)))
                                        else:
                                            # print latexEscape(c)
                                            innerlist_item_str += latex_escape(c)
                                    #print innerlist_item_str
                                    #xetex_output.append('\\item %s'%(latexEscape(innerlist_item_tag.get_text(strip=True)[2:])))
                                    resume_text_f.write(re.sub(r'\s+', ' ', '- ' + innerlist_item_str[2:]) + '\r')
                                    xetex_output.append('\\item %s'%innerlist_item_str[2:])
                                xetex_output.append('\\end{innerlist}')
                        
                        if child.next_sibling is None:
                            xetex_output.append('\\end{outerlist}')
                            xetex_output.append('\\vspace{\\baselineskip}')
                            xetex_output.append('')
                            
            if section_id == 'publications':
                xetex_output.append('\\end{bibsection}')
            elif section_id == 'conferences':
                pass
            elif section_id == 'awards_and_recognition':
                xetex_output.append('\\end{loneinnerlist}')
            xetex_output.append('\\vspace{2.0\\baselineskip}')
            xetex_output.append('')
            xetex_output.append('')

    xetex_output.append(xetex_template[1])
    
    if args.print_ver:
        out_f = open('../tex/pdf_print.xetex','w')
    else:
        out_f = open('../tex/pdf_web.xetex','w')

    for i in xetex_output:
        out_f.write(i + '\r')

    out_f.close()
    html_f.close()
    xetex_template_f.close()
    resume_text_f.close()


if __name__ == "__main__": 
    sys.exit(main())
