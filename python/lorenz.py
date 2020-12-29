#!/usr/bin/env python

import sys
from optparse import OptionParser


def lorenzSys(inx, iny, inz, sigma, rho, beta, dt=.01):
    dx = ( sigma * (iny - inx) ) * dt
    dy = ( inx * (rho - inz) - iny ) * dt
    dz = ( inx * iny - beta * inz ) * dt

    return inx + dx, iny + dy, inz + dz
  
  
def main(argv=None):
    if argv is None:
        argv = sys.argv
    
    parser = OptionParser()
    parser.add_option("-s", "--sigma",
                dest="sigma", default=10,
                help=""
                )
    parser.add_option("-r", "--rho",
                  dest="rho", default=28,
                  help=""
                  )
    parser.add_option("-b", "--beta",
                      dest="beta", default=2.66666666666667,
                      help=""
                      )
    parser.add_option("-i", "--initial",
                  dest="initial", default=None,
                  help=""
                  )
    parser.add_option("-c", "--cycles",
                  dest="cycles", default=10000,
                  help=""
                  )

    (options, args) = parser.parse_args()

    sigma = float(options.sigma)
    rho = float(options.rho)
    beta = float(options.beta)
    initial = options.initial
    cycles = int(options.cycles)

    if initial is None:
        initial = (5.0,5.0,5.0)
    else:
        initial = map(float,initial.split(','))

    inx = initial[0]
    iny = initial[1]
    inz = initial[2]

    print 'x y z'
    for it in range(cycles):
        print inx, iny, inz
        outx, outy, outz = lorenzSys(inx, iny, inz, sigma, rho, beta)
        inx = outx
        iny = outy
        inz = outz


if __name__ == "__main__": 
    sys.exit(main())
