import grammar

def test_diagnosis():
    diagnosis_rule = grammar.rules[0]
    actual = diagnosis_rule.parse("diagnosed pranav with cance")
    assert actual['status'] == 'accept'
    assert actual['properties']['disease'] == 'cance'
    assert actual['properties']['patient'] == 'pranav'

def test_examination():
    examination_rule = grammar.rules[1]
    raw_text = 'performed anal probe, catscan on pranav'
    actual = examination_rule.parse(raw_text)
    assert actual['status'] == 'accept'
    assert actual['properties']['exams'] == ['anal probe', 'catscan']
    assert actual['properties']['patient'] == 'pranav'

def test():
    test_diagnosis()
    test_examination()

if __name__ == '__main__':
    test()
