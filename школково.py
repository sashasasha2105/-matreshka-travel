# def g(x):
#     f = set()
#     for i in range(1,int(x**0.5)+1):
#         if x % i ==0:
#             f.add(i)
#             f.add(x//i)
#     return sorted(f)
# for d in range(800001,810000):
#     s = g(d)
#     s1 = [x for x in s if x % 2 !=0 and x!=1 and x !=d]


# c=0
# for s in open("9we21.txt"):
#     a = sorted([int(x) for x in s.split()])
#     a1 = [x for x in a if x == max(a)]
#     a2 = sorted([x for x in a if a.count(x)==1])
#     if ((len(a1)==3 and len(a2)==5) or ((len(a1)==4 and len(a2)==4))) and (a2[0]+a2[-1])<=(sum(a2)-max(a2)-min(a2)):
#         c+=1
# print(c)
# from math import *
# f = open("5_A_qwdqwd_62ruo.txt")
# a = [list(map(float, i.replace(",",".").split())) for i in f]
# cl = []
# while a :
#     cl.append([a.pop(0)])
#     for j in cl[-1]:
#         for i in a[:]:
#             if dist(j,i)<2:
#                 cl[-1].append(i)
#                 a.remove(i)
#
# for j in cl[:]:
#     if len(j)<12:
#         cl.remove(j)
#
#
# z = []
# for j in cl:
#     mn = 10**10
#     for star in j:
#         s = 0
#         for i in j:
#             s+=dist(star,i)
#         if s <mn:
#             mn = s
#             mn_star = star
#     z.append(mn_star)
# cx = int((abs((z[0][0]+z[1][0])/2))*100)
# cy= int((abs((z[0][1]+z[1][1])/2))*100)
# cz=int((abs((z[0][2]+z[1][2])/2))*100)
# print(cx,cy,cz)

# from math import *
# f = open("27-92b.txt")
# a = [list(map(float,i.replace(",",".").split())) for i in f]
# cl = []
# r = 0.5
# while a:
#     cl.append([a.pop(0)])
#     for j in cl[-1]:
#         for i in a[:]:
#             if dist(j,i)<r:
#                 cl[-1].append(i)
#                 a.remove(i)
#
#
# print(len(cl))
# z = []
# for j in cl:
#     mn = 10**10
#     for star in j:
#         s = 0
#         for i in j:
#             s+=dist(star,i)
#         if s < mn:
#             mn = s
#             mn_star = star
#     z.append(mn_star)
#
# zx = int(((z[0][0]+z[1][0]+z[2][0])/3)*100000)
# zy = int(((z[0][1]+z[1][1]+z[2][1])/3)*100000)
# print(zx,zy)








#
# from turtle import *
# m = 20
# screensize(2000,2000)
# tracer(0)
# pu()
# clk=["red","blue","pink"]
# for j in range(3):
#     for i in cl[j]:
#         x,y = i
#         goto(x*m,y*m)
#         dot(3,clk[j])
# done()d