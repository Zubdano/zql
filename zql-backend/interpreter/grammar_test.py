import grammar

def test_keywords():
    assert sorted(grammar.keywords) == ['diagnosed','on', 'performed', 'with']

def test_diagnosis():
    sentence = 'diagnosed pranav with cance'
    res = grammar.parse_sentence(sentence)
    assert res['status'] == 'accept'
    assert res['properties']['disease'] == ['cance']
    assert res['properties']['patient'] == 'pranav'

def test_examination():
    sentence = 'performed anal probe, catscan on pranav'
    actual = grammar.parse_sentence(sentence)
    assert actual['status'] == 'accept'
    assert actual['properties']['exams'] == ['anal probe', 'catscan']
    assert actual['properties']['patient'] == 'pranav'

def test():
    test_keywords()
    test_diagnosis()
    test_examination()

if __name__ == '__main__':
    test()
