# AUTOMATICALLY GENERATED
from arpeggio import Optional, ZeroOrMore, OneOrMore, EOF, ParserPython, NoMatch, RegExMatch

def amount(): return number, unit

def date(): return RegExMatch(r'\d\d\d\d-([0-9][0-9])-([0-9][0-9])')

def diagnosis(): return "diagnosed", patient, "with", disease

def died_at(): return "death", "of", patient, "on", date

def disease(): return ["cancer", "diabetes", "aids"]

def drug(): return ["aspirin", "ibuprofen", "penicillin", "tylenol"]

def drug_amount(): return OneOrMore(amount, "of", drug, sep=',')

def examination(): return "performed", exams, "on", patient

def exams(): return OneOrMore(["colonoscopy", "mri", "catscan", "chemotherapy"], sep=',')

def mass(): return ["mg", "g"]

def number(): return RegExMatch(r'[0-9]+')

def patient(): return RegExMatch(r'[a-zA-Z]+')

def prescription(): return "prescribed", drug_amount, "to", patient

def root(): return [diagnosis, prescription, examination, died_at, schedules]

def schedules(): return "scheduled", exams, "for", patient, "on", date

def unit(): return [volume, mass]

def volume(): return ["ml", "fl. oz"]

